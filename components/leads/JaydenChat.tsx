"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What should I study today?",
  "Which lead requires follow-up?",
  "How many classes can I skip?",
  "What is pending today?",
];

function id() {
  return Math.random().toString(36).slice(2);
}

export default function JaydenChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    const userMsg: Message = { id: id(), role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
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
    <div className="card-glow relative z-10 flex h-[calc(100vh-220px)] min-h-[400px] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles size={16} />
              I'm Jayden — ask me anything across MITTAL OS. Leads, tasks, attendance, prep, jobs, money.
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
                "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"
              )}
            >
              {m.content || (sending && m.role === "assistant" ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2 border-t border-border pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Ask Jayden…"
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground"
        />
        <Button onClick={() => send(input)} disabled={sending || !input.trim()}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
