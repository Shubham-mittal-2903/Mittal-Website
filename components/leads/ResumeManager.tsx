"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Download, Trash2, Upload } from "lucide-react";
import { createResume, setActiveResume, deleteResume, getResumeUrl } from "@/lib/actions/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type ResumeItem = {
  id: string;
  name: string;
  version: number;
  targetRole: string | null;
  isActive: boolean;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
};

export default function ResumeManager({ resumes }: { resumes: ResumeItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      let uploaded: { storagePath: string; fileName: string } | null = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "resume");
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
        const json = await res.json();
        uploaded = { storagePath: json.storagePath, fileName: json.fileName };
      }
      await createResume({ name, targetRole, notes }, uploaded);
      setName("");
      setTargetRole("");
      setNotes("");
      setFile(null);
      toast.success("Resume added");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add resume");
    } finally {
      setSaving(false);
    }
  }

  async function onDownload(storagePath: string) {
    try {
      const url = await getResumeUrl(storagePath);
      window.open(url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open file");
    }
  }

  async function onSetActive(id: string) {
    await setActiveResume(id);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    await deleteResume(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="card-glow relative z-10 space-y-3">
        <h3 className="text-sm font-semibold">Add a resume</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Name, e.g. SDE Resume v3" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
        </div>
        <Textarea placeholder="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
            <Upload size={14} />
            {file ? file.name : "Attach PDF/DOCX"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button onClick={onCreate} disabled={saving || !name.trim()}>
            {saving ? "Saving…" : "Add resume"}
          </Button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="card-glow relative z-10 py-16 text-center text-sm text-muted-foreground">
          No resumes yet — add your first one above.
        </div>
      ) : (
        <div className="space-y-2">
          {resumes.map((r) => (
            <div key={r.id} className="card-glow relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">v{r.version}</span>
                  {r.isActive && <Badge>Active</Badge>}
                </div>
                {r.targetRole && <p className="text-xs text-muted-foreground">{r.targetRole}</p>}
              </div>
              <div className="flex items-center gap-1">
                {!r.isActive && (
                  <Button size="sm" variant="ghost" onClick={() => onSetActive(r.id)} title="Set active">
                    <Star size={14} />
                  </Button>
                )}
                {r.fileUrl && (
                  <Button size="sm" variant="ghost" onClick={() => onDownload(r.fileUrl!)} title="Download">
                    <Download size={14} />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(r.id)} title="Delete">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
