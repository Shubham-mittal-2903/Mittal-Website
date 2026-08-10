import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildMosContext } from "@/lib/ai/mos-context";
import { JAYDEN_OS_SYSTEM_PROMPT } from "@/lib/ai/jayden-os-prompt";
import { readRepoFiles, proposeChange } from "@/lib/ai/github-tools";
import { markAttendanceBatch, createTaskTool, updateLeadStageTool, logTransactionTool, setPrepTopicStatusTool } from "@/lib/ai/data-tools";
import type { LeadStatus, TaskPriority, PrepTopicStatus, TransactionType } from "@/lib/generated/prisma/client";

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

// Always available (no GITHUB_TOKEN needed) — these operate on the app's own database, the
// same server actions every /leads page already uses under the hood.
const DATA_TOOLS: Anthropic.Tool[] = [
  {
    name: "mark_attendance",
    description:
      "Record attendance for one or more classes — present, absent, or a cancelled class that shouldn't count. Use this whenever Shubham tells you about attendance, including backlogs of several days at once. Subjects are matched by name or code (e.g. \"FREN146\") against existing College subjects — if no match exists yet, a new subject is created automatically so the record is never dropped.",
    input_schema: {
      type: "object",
      properties: {
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              subjectName: { type: "string", description: "Subject name or code as Shubham said it" },
              mark: { type: "string", enum: ["PRESENT", "ABSENT", "CANCELLED"] },
              date: { type: "string", description: "YYYY-MM-DD, defaults to today if omitted" },
            },
            required: ["subjectName", "mark"],
          },
        },
      },
      required: ["entries"],
    },
  },
  {
    name: "create_task",
    description: "Add a task to the Planner.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        dueDate: { type: "string", description: "YYYY-MM-DD, optional" },
        priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
        listName: { type: "string", description: "optional bucket, e.g. \"Mission August\"" },
      },
      required: ["title"],
    },
  },
  {
    name: "update_lead_stage",
    description: "Move a lead in the CRM to a new pipeline stage — matched by company name.",
    input_schema: {
      type: "object",
      properties: {
        company: { type: "string" },
        newStage: {
          type: "string",
          enum: ["SOURCED", "CONTACTED", "REPLIED", "DISCOVERY_BOOKED", "DISCOVERY_DONE", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"],
        },
        note: { type: "string", description: "optional context for why it moved" },
      },
      required: ["company", "newStage"],
    },
  },
  {
    name: "log_transaction",
    description: "Log an income or expense transaction in Finance.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["INCOME", "EXPENSE"] },
        amount: { type: "number" },
        description: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD, defaults to today" },
        categoryName: { type: "string", description: "optional — created if it doesn't exist yet" },
      },
      required: ["type", "amount"],
    },
  },
  {
    name: "set_prep_topic_status",
    description:
      "Update a Placement Preparation topic's status — this IS the manual approval the app requires, so only call it when Shubham has actually told you the real status, never to guess or auto-complete something.",
    input_schema: {
      type: "object",
      properties: {
        topicTitle: { type: "string" },
        status: { type: "string", enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "SKIPPED", "BLOCKED"] },
      },
      required: ["topicTitle", "status"],
    },
  },
];

const CODE_TOOLS: Anthropic.Tool[] = [
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
    switch (name) {
      case "mark_attendance":
        return await markAttendanceBatch(
          Array.isArray(input.entries) ? (input.entries as Array<{ subjectName: string; mark: "PRESENT" | "ABSENT" | "CANCELLED"; date?: string }>) : []
        );
      case "create_task":
        return await createTaskTool({
          title: String(input.title ?? ""),
          dueDate: input.dueDate ? String(input.dueDate) : undefined,
          priority: input.priority as TaskPriority | undefined,
          listName: input.listName ? String(input.listName) : undefined,
        });
      case "update_lead_stage":
        return await updateLeadStageTool({
          company: String(input.company ?? ""),
          newStage: input.newStage as LeadStatus,
          note: input.note ? String(input.note) : undefined,
        });
      case "log_transaction":
        return await logTransactionTool({
          type: input.type as TransactionType,
          amount: Number(input.amount),
          description: input.description ? String(input.description) : undefined,
          date: input.date ? String(input.date) : undefined,
          categoryName: input.categoryName ? String(input.categoryName) : undefined,
        });
      case "set_prep_topic_status":
        return await setPrepTopicStatusTool({
          topicTitle: String(input.topicTitle ?? ""),
          status: input.status as PrepTopicStatus,
        });
      case "read_repo_files":
        return await readRepoFiles(Array.isArray(input.paths) ? (input.paths as string[]) : []);
      case "propose_change":
        return await proposeChange({
          branchName: String(input.branchName ?? "change"),
          title: String(input.title ?? "Jayden change"),
          description: String(input.description ?? ""),
          files: Array.isArray(input.files) ? (input.files as Array<{ path: string; content: string }>) : [],
        });
      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : "unknown error"}`;
  }
}

function statusLineFor(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "mark_attendance":
      return `\n\n_Recording attendance…_\n\n`;
    case "create_task":
      return `\n\n_Adding task "${String(input.title ?? "")}"…_\n\n`;
    case "update_lead_stage":
      return `\n\n_Updating ${String(input.company ?? "lead")}…_\n\n`;
    case "log_transaction":
      return `\n\n_Logging transaction…_\n\n`;
    case "set_prep_topic_status":
      return `\n\n_Updating prep topic…_\n\n`;
    case "read_repo_files": {
      const paths = Array.isArray(input.paths) ? (input.paths as string[]) : [];
      return `\n\n_Reading ${paths.map((p) => `\`${p}\``).join(", ")}…_\n\n`;
    }
    case "propose_change":
      return `\n\n_Opening a pull request — "${String(input.title ?? "")}"…_\n\n`;
    default:
      return "";
  }
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
  const tools = [...DATA_TOOLS, ...(process.env.GITHUB_TOKEN ? CODE_TOOLS : [])];

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
            tools,
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
