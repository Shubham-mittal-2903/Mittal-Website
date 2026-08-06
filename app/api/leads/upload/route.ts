import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, ATTACHMENTS_BUCKET } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES = ["SCREENSHOT", "AUDIT_REPORT", "VIDEO", "CONTRACT", "INVOICE", "NOTE", "OTHER"] as const;
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request: NextRequest) {
  // Defense-in-depth — middleware already gates /api/leads/*, but never trust that alone.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const leadId = formData.get("leadId");
  const categoryRaw = formData.get("category");

  if (!(file instanceof File) || typeof leadId !== "string" || !leadId) {
    return NextResponse.json({ error: "Missing file or leadId" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 25MB limit" }, { status: 400 });
  }
  const category = CATEGORIES.includes(categoryRaw as (typeof CATEGORIES)[number])
    ? (categoryRaw as (typeof CATEGORIES)[number])
    : "OTHER";

  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `leads/${leadId}/${Date.now()}-${safeName}`;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(storagePath, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const attachment = await db.attachment.create({
    data: {
      leadId,
      category,
      fileName: file.name,
      storagePath,
      fileSize: file.size,
      mimeType: file.type || null,
    },
  });

  return NextResponse.json({ attachment });
}
