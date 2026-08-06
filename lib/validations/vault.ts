import { z } from "zod";

export const VAULT_ITEM_TYPES = [
  "PDF",
  "DOCX",
  "EXCEL",
  "IMAGE",
  "VIDEO",
  "RESEARCH",
  "CLAUDE_PROMPT",
  "CHATGPT_PROMPT",
  "MEETING_NOTES",
  "OTHER",
] as const;

// The Documents sidebar page is VaultItem filtered to these — real files, not prompts/notes.
export const DOCUMENT_TYPES = ["PDF", "DOCX", "EXCEL", "IMAGE", "VIDEO"] as const;

export const VAULT_TYPE_LABELS: Record<(typeof VAULT_ITEM_TYPES)[number], string> = {
  PDF: "PDF",
  DOCX: "Word Doc",
  EXCEL: "Spreadsheet",
  IMAGE: "Image",
  VIDEO: "Video",
  RESEARCH: "Research",
  CLAUDE_PROMPT: "Claude Prompt",
  CHATGPT_PROMPT: "ChatGPT Prompt",
  MEETING_NOTES: "Meeting Notes",
  OTHER: "Other",
};

export const vaultItemFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(VAULT_ITEM_TYPES),
  content: z.string().optional(),
  tags: z.string().optional(),
});
export type VaultItemFormInput = z.infer<typeof vaultItemFormSchema>;
