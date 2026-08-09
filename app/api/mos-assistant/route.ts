import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildMosContext } from "@/lib/ai/mos-context";
import { JAYDEN_OS_SYSTEM_PROMPT } from "@/lib/ai/jayden-os-prompt";
import { readRepoFiles, proposeChange } from "@/lib/ai/github-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // tool-use turns (GitHub API round-trips) run longer than a plain chat reply

type ChatRole = "user" | "assistant";
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

type TextBlock = { type: "text"; text: string };
type ImageBlock = { type: "image"; mediaType: AllowedImageType; data: string };
type ChatMessage = { role: ChatRole; content: string | Array<TextBlock | ImageBlock> };

function isTextBlock(b: unknown): b is TextBlock {
  if (!b || typeof b !== "object") return false;
  const x = b as { type?: unknown; text?: unknown };
  return x.type === "text" && typeof x.text === "string";
}

function isImageBlock(b: unknown): b is ImageBlock {
  if (!b || typeof b !== "object") return false;
  const x = b as { type?: unknown; mediaType?: unknown; data?: unknown };
  return (
    x.type === "image" &&
    typeof x.mediaType === "string" &&
    (ALLOWED_IMAGE_TYPES as readonly string[]).includes(x.mediaType) &&
    typeof x.data === "string" &&
    x.data.length > 0
  );
}

function isChatMessage(m: unknown): m is ChatMessage {
  if (!m || typeof m !== "object") return false;
  const x = m as { role?: unknown; content?: unknown };
  if (x.role !== "user" && x.role !== "assistant") return false;
  if (typeof x.content === "string") return x.content.length > 0;
  if (Array.isArray(x.content)) {
    return x.content.length > 0 && x.content.every((b) => isTextBlock(b) || isImageBlock(b));
  }
  return false;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_TOOL_ROUNDS = 8;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "read_repo_files",
    description:
      "Read the current contents of one or more files in the mittal-website repo (main branch), or list a directory's contents. Always use this before proposing any change — never write code against a file you haven't actually read.",
    input_schema: {
      type: "object",
      properties: {
        paths: {
          type: "array",
          items: { type: "string" },
          description: "Repo-relative file or directory paths, e.g. \"app/leads/(dashboard)/planner/page.tsx\" or \"components/leads\"",
        },
      },
      required: ["paths"],
    },
  },
  {
    name: "propose_change",
    description:
      "Create a new branch, commit one or more file changes to it, and open a pull request against main. This NEVER deploys or merges anything — Shubham reviews and merges the PR himself. Refuses .env files, CI/CD config, and anything that looks like a secret.",
    input_schema: {
      type: "object",
      properties: {
        branchName: { type: "string", description: "short kebab-case branch suffix, e.g. \"add-notes-field\" (gets prefixed with jayden/)" },
        title: { type: "string", description: "PR title" },
        description: { type: "string", description: "PR description — plain-language explanation of what changed and why" },
        files: {
          type: "array",
          items: {
            type: "object",
            properties: { path: { type: "string" }, content: { type: "string" } },
            required: ["path", "content"],
          },
        },
      },
      required: ["branchName", "title", "description", "files"],
    },
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    if (name === "read_repo_files") {
      const paths = Array.isArray(input.paths) ? (input.paths as string[]) : [];
      return await readRepoFiles(paths);
    }
    if (name === "propose_change") {
      return await proposeChange({
        branchName: String(input.branchName ?? "change"),
        title: String(input.title ?? "Jayden change"),
        description: String(input.description ?? ""),
        files: Array.isArray(input.files) ? (input.files as Array<{ path: string; content: string }>) : [],
      });
    }
    return `Unknown tool: ${name}`;
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : "unknown error"}`;
  }
}

function statusLineFor(name: string, input: Record<string, unknown>): string {
  if (name === "read_repo_files") {
    const paths = Array.isArray(input.paths) ? (input.paths as string[]) : [];
    return `\n\n_Reading ${paths.map((p) => `\`${p}\``).join(", ")}…_\n\n`;
  }
  if (name === "propose_change") {
    return `\n\n_Opening a pull request — "${String(input.title ?? "")}"…_\n\n`;
  }
  return "";
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
  const parsed = rawMessages.filter(isChatMessage).slice(-20);

  if (parsed.length === 0 || parsed[parsed.length - 1].role !== "user") {
    return new Response(JSON.stringify({ ok: false, error: "Missing user message." }), { status: 400 });
  }

  for (const m of parsed) {
    if (Array.isArray(m.content)) {
      for (const b of m.content) {
        if (b.type === "image" && b.data.length > MAX_IMAGE_BYTES) {
          return new Response(JSON.stringify({ ok: false, error: "Image too large (max ~5MB)." }), { status: 400 });
        }
      }
    }
  }

  const conversation: Anthropic.MessageParam[] = parsed.map((m) => ({
    role: m.role,
    content:
      typeof m.content === "string"
        ? m.content
        : m.content.map((b) =>
            b.type === "text"
              ? { type: "text" as const, text: b.text }
              : { type: "image" as const, source: { type: "base64" as const, media_type: b.mediaType, data: b.data } }
          ),
  }));

  const context = await buildMosContext();
  const client = new Anthropic({ apiKey });
  const tools = process.env.GITHUB_TOKEN ? TOOLS : undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const llmStream = client.messages.stream({
            model: "claude-opus-5",
            max_tokens: 1500,
            system: `${JAYDEN_OS_SYSTEM_PROMPT}${context}`,
            messages: conversation,
            ...(tools ? { tools } : {}),
          });

          for await (const event of llmStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          const finalMessage = await llmStream.finalMessage();

          if (finalMessage.stop_reason !== "tool_use") {
            controller.close();
            return;
          }

          conversation.push({ role: "assistant", content: finalMessage.content });

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const block of finalMessage.content) {
            if (block.type !== "tool_use") continue;
            const input = (block.input ?? {}) as Record<string, unknown>;
            controller.enqueue(encoder.encode(statusLineFor(block.name, input)));
            const result = await runTool(block.name, input);
            toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
          }

          conversation.push({ role: "user", content: toolResults });
        }

        controller.enqueue(encoder.encode("\n\n_(Stopped after several tool steps — ask me to continue if needed.)_"));
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
