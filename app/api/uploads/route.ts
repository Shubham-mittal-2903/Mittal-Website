import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, ATTACHMENTS_BUCKET } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Generic authenticated upload for any /leads module that isn't the Lead-scoped
// Attachment flow (app/api/leads/upload) — Resume Manager, Knowledge Vault, etc.
// Returns the storage path only; the caller's own server action persists the DB row,
// since each module has a different shape for that row.
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const KINDS = ["resume", "vault"] as const;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const kindRaw = formData.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!KINDS.includes(kindRaw as (typeof KINDS)[number])) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 });
  }

  const kind = kindRaw as (typeof KINDS)[number];
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${kind}/${Date.now()}-${safeName}`;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(storagePath, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  return NextResponse.json({
    storagePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || null,
  });
}
