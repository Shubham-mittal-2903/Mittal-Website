"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ImagePlus, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TextBlock = { type: "text"; text: string };
type ImageBlock = { type: "image"; mediaType: string; data: string };
type MessageContent = string | Array<TextBlock | ImageBlock>;
type Message = { id: string; role: "user" | "assistant"; content: MessageContent };

type PendingImage = { file: File; mediaType: string; data: string; previewUrl: string };

const SUGGESTIONS = [
  "What should I study today?",
  "Which lead requires follow-up?",
  "How many classes can I skip?",
  "What is pending today?",
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function id() {
  return Math.random().toString(36).slice(2);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderContent(content: MessageContent) {
  if (typeof content === "string") return content;
  return content
    .filter((b): b is TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function imagesOf(content: MessageContent): ImageBlock[] {
  if (typeof content === "string") return [];
  return content.filter((b): b is ImageBlock => b.type === "image");
}

// The one visual element that actually reads as "AI" rather than "chat widget" — a rotating
// glow ring, always alive, spinning faster while Jayden is actually thinking/responding.
function JaydenOrb({ active, size = 36 }: { active: boolean; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, hsl(var(--foreground)) 0%, transparent 30%, hsl(var(--muted-foreground)) 55%, transparent 80%, hsl(var(--foreground)) 100%)",
          filter: "blur(3px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: active ? 2.2 : 7, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, hsl(var(--foreground) / 0.5), transparent 70%)" }}
        animate={{ scale: active ? [1, 1.25, 1] : [1, 1.08, 1], opacity: active ? [0.5, 0.8, 0.5] : [0.3, 0.45, 0.3] }}
        transition={{ duration: active ? 1.4 : 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-background">
        <Bot size={size * 0.42} className="text-foreground" />
      </div>
      <motion.span
        className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function StreamingCursor() {
  return (
    <motion.span
      className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-current"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.51, 1] }}
    />
  );
}

export default function JaydenChat({ height = "h-[calc(100vh-220px)]" }: { height?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [sending, setSending] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onPickImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImageError(null);
    const next: PendingImage[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setImageError("Only JPEG, PNG, GIF, or WebP images are supported.");
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setImageError("Each image must be under 5MB.");
        continue;
      }
      const data = await fileToBase64(file);
      next.push({ file, mediaType: file.type, data, previewUrl: URL.createObjectURL(file) });
    }
    setPendingImages((p) => [...p, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePendingImage(index: number) {
    setPendingImages((p) => p.filter((_, i) => i !== index));
  }

  async function send(text: string) {
    if ((!text.trim() && pendingImages.length === 0) || sending) return;

    const blocks: Array<TextBlock | ImageBlock> = [];
    if (text.trim()) blocks.push({ type: "text", text: text.trim() });
    for (const img of pendingImages) blocks.push({ type: "image", mediaType: img.mediaType, data: img.data });

    const userMsg: Message = { id: id(), role: "user", content: blocks.length === 1 && blocks[0].type === "text" ? blocks[0].text : blocks };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setPendingImages([]);
    setSending(true);

    try {
      const res = await fetch("/api/mos-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) }),
      });

      if (res.ok && res.body) {
        const assistantId = id();
        setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: buf } : x)));
        }
      } else {
        const json = await res.json().catch(() => ({ error: "Something went wrong." }));
        setMessages((m) => [...m, { id: id(), role: "assistant", content: json.error ?? "Something went wrong." }]);
      }
    } catch {
      setMessages((m) => [...m, { id: id(), role: "assistant", content: "Network error — try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={cn("card-glow relative z-10 flex min-h-[320px] flex-col overflow-hidden", height)}>
      {/* Ambient glow — always present, not just on hover, so the panel feels alive at rest */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, hsl(var(--foreground)), transparent 70%)" }}
        animate={{ scale: sending ? [1, 1.15, 1] : [1, 1.05, 1], opacity: sending ? [0.1, 0.16, 0.1] : [0.06, 0.09, 0.06] }}
        transition={{ duration: sending ? 2.5 : 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mb-3 flex items-center gap-2.5 border-b border-border pb-3">
        <JaydenOrb active={sending} />
        <div>
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-sm font-semibold text-transparent">
            Jayden
          </span>
          <span className="ml-2 text-xs text-muted-foreground">grounded in your live data</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles size={16} />
              Ask me anything across MITTAL OS, or drop in a screenshot to analyze.
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(s)}
                  className="rounded-lg border border-input px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => {
            const isAssistant = m.role === "assistant";
            const text = renderContent(m.content);
            const isEmptyPending = isAssistant && sending && text === "";
            const isStreamingNow = isAssistant && sending && idx === messages.length - 1 && text !== "";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={cn("flex items-end gap-2", isAssistant ? "justify-start" : "justify-end")}
              >
                {isAssistant && <JaydenOrb active={isStreamingNow || isEmptyPending} size={22} />}
                <div
                  className={cn(
                    "max-w-[75%] space-y-2 whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                    isAssistant
                      ? "border-l-2 border-foreground/20 bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {imagesOf(m.content).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {imagesOf(m.content).map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={`data:${img.mediaType};base64,${img.data}`}
                          alt="Attached"
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {isEmptyPending ? (
                    <TypingDots />
                  ) : (
                    <>
                      {text}
                      {isStreamingNow && <StreamingCursor />}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {pendingImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mt-3 flex flex-wrap gap-2 overflow-hidden border-t border-border pt-3"
          >
            {pendingImages.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.previewUrl} alt="" className="h-14 w-14 rounded-md object-cover" />
                <button
                  onClick={() => removePendingImage(i)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {imageError && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 mt-2 text-xs text-destructive">
          {imageError}
        </motion.p>
      )}

      <div className="relative z-10 mt-4 flex gap-2 border-t border-border pt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => onPickImages(e.target.files)}
        />
        <motion.div whileTap={{ scale: 0.94 }}>
          <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Attach image">
            <ImagePlus size={16} />
          </Button>
        </motion.div>
        <div className="relative flex-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask Jayden…"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground transition-colors focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
        </div>
        <motion.div whileTap={{ scale: 0.94 }}>
          <Button onClick={() => send(input)} disabled={sending || (!input.trim() && pendingImages.length === 0)}>
            <Send size={16} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
