import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Free Microsoft Edge neural voice — no cloning, no per-call cost. Same voice family JAYDEN
// Voice (the standalone desktop assistant) uses, picked to read as warm/female rather than a
// flat default TTS voice.
const DEFAULT_VOICE = "en-US-AriaNeural";
const MAX_CHARS = 2000; // a single chat reply is never this long; guards against abuse of a free external call

export async function POST(req: Request) {
  // Defense-in-depth — middleware already gates /api/mos-assistant/*, but never trust that alone
  // (see app/api/mos-assistant/route.ts for the same pattern).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  let body: { text?: unknown; voice?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return new Response(JSON.stringify({ error: "text is required" }), { status: 400 });
  if (text.length > MAX_CHARS) {
    return new Response(JSON.stringify({ error: `text too long (max ${MAX_CHARS} chars)` }), { status: 400 });
  }
  const voice = typeof body.voice === "string" && body.voice ? body.voice : DEFAULT_VOICE;

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = await tts.toStream(text);

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) chunks.push(chunk as Buffer);
    const audio = Buffer.concat(chunks);

    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("jayden tts error:", err instanceof Error ? err.message : err);
    return new Response(JSON.stringify({ error: "TTS failed" }), { status: 500 });
  }
}
