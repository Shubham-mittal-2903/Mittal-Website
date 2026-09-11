import { rememberFact, recallMemories, listRecentMemories } from "@/lib/ai/data-tools";

// The ONE shared brain for every "Jayden" surface Shubham runs -- MITTAL OS's own assistant
// (app/api/mos-assistant/route.ts) reads/writes JaydenMemory directly via Prisma since it's
// already inside this app. jayden-voice and jayden-app run on Shubham's own laptop, outside
// this app entirely, so they need a real network-callable endpoint to reach the same table --
// this route is that endpoint.
//
// NOT behind middleware.ts's Supabase-cookie gate (see its matcher list) -- a local Node script
// has no browser session to present. Auth here is a single static bearer secret instead, the
// same trust model as GITHUB_TOKEN/ANTHROPIC_API_KEY elsewhere in this app: single user, single
// owner, a shared secret is enough. Never accept requests without it.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const key = process.env.JAYDEN_MEMORY_API_KEY;
  if (!key) return false; // fail closed if the secret was never configured
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${key}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const topK = Number(searchParams.get("topK") ?? "5") || 5;

  try {
    const memories = query ? await recallMemories(query, topK) : await listRecentMemories(topK);
    return Response.json({ memories });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown error" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  let body: { content?: unknown; tier?: unknown; category?: unknown; importance?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), { status: 400 });
  }

  if (typeof body.content !== "string" || !body.content.trim()) {
    return new Response(JSON.stringify({ error: "content is required" }), { status: 400 });
  }
  const tier = body.tier === "LONG" ? "LONG" : "MEDIUM";

  try {
    const entry = await rememberFact({
      content: body.content,
      tier,
      category: typeof body.category === "string" ? body.category : undefined,
      importance: typeof body.importance === "number" ? body.importance : undefined,
    });
    return Response.json({ memory: entry });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown error" }), { status: 500 });
  }
}
