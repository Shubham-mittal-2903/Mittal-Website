"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Download, Trash2, FileText } from "lucide-react";
import { getAttachmentUrl, deleteAttachment } from "@/lib/actions/attachments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const CATEGORIES = ["SCREENSHOT", "AUDIT_REPORT", "VIDEO", "CONTRACT", "INVOICE", "NOTE", "OTHER"] as const;

type Attachment = {
  id: string;
  fileName: string;
  category: string;
  fileSize: number | null;
  storagePath: string;
  uploadedAt: Date;
};

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsTab({ leadId, attachments }: { leadId: string; attachments: Attachment[] }) {
  const router = useRouter();
  const [category, setCategory] = useState<string>("SCREENSHOT");
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("leadId", leadId);
      formData.append("category", category);
      const res = await fetch("/api/leads/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      toast.success(`${file.name} uploaded`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDownload(a: Attachment) {
    setBusyId(a.id);
    try {
      const url = await getAttachmentUrl(a.storagePath);
      window.open(url, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get download link");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(a: Attachment) {
    setBusyId(a.id);
    try {
      await deleteAttachment(a.id, leadId);
      toast.success("Deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card-glow relative z-10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Documents</h3>
        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
            <Upload size={14} />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
          <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {attachments.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">
          No documents yet. Upload screenshots, audit reports, contracts or invoices.
        </p>
      ) : (
        <div className="relative z-10 space-y-2">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{a.fileName}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                      {a.category.replace("_", " ")}
                    </Badge>
                    {formatSize(a.fileSize)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownload(a)}
                  disabled={busyId === a.id}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Download"
                >
                  <Download size={15} />
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  disabled={busyId === a.id}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
