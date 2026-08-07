import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildMosContext } from "@/lib/ai/mos-context";
import { JAYDEN_OS_SYSTEM_PROMPT } from "@/lib/ai/jayden-os-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

function isChatMessage(m: unknown): m is ChatMessage {
  if (!m || typeof m !== "object") return false;
  const x = m as { role?: unknown; content?: unknown };
  return (x.role === "user" || x.role === "assistant") && typeof x.content === "string" && x.content.length > 0;
}

export async function POST(req: Request) {
  // Defense-in-depth — middleware already gates /api/mos-assistant/*, but never trust that alone.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Jayden isn't configured yet — set ANTHROPIC_API_KEY in .env / Vercel env vars to enable it.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON." }), { status: 400 });
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages.filter(isChatMessage).slice(-20);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return new Response(JSON.stringify({ ok: false, error: "Missing user message." }), { status: 400 });
  }

  const context = await buildMosContext();
  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const llmStream = await client.messages.stream({
          model: "claude-opus-5",
          max_tokens: 1200,
          system: `${JAYDEN_OS_SYSTEM_PROMPT}${context}`,
          messages,
        });

        for await (const event of llmStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\n_(Something went wrong: ${msg})_`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
