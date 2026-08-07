"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ImagePlus, X } from "lucide-react";
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
    <div className={cn("card-glow relative z-10 flex min-h-[320px] flex-col", height)}>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles size={16} />
              I'm Jayden — ask me anything across MITTAL OS, or drop in a screenshot to analyze.
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-input px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] space-y-2 whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"
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
              {renderContent(m.content) || (sending && m.role === "assistant" ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {pendingImages.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {pendingImages.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt="" className="h-14 w-14 rounded-md object-cover" />
              <button
                onClick={() => removePendingImage(i)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      {imageError && <p className="mt-2 text-xs text-destructive">{imageError}</p>}

      <div className="mt-4 flex gap-2 border-t border-border pt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => onPickImages(e.target.files)}
        />
        <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Attach image">
          <ImagePlus size={16} />
        </Button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask Jayden…"
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground"
        />
        <Button onClick={() => send(input)} disabled={sending || (!input.trim() && pendingImages.length === 0)}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
