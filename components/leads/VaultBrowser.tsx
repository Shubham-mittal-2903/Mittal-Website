"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Trash2, Upload, Search } from "lucide-react";
import { createVaultItem, deleteVaultItem, getVaultItemUrl } from "@/lib/actions/vault";
import { VAULT_TYPE_LABELS, type VAULT_ITEM_TYPES } from "@/lib/validations/vault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type VaultType = (typeof VAULT_ITEM_TYPES)[number];

export type VaultItem = {
  id: string;
  title: string;
  type: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  tags: string[];
  createdAt: string;
};

export default function VaultBrowser({
  items,
  allowedTypes,
  addLabel,
}: {
  items: VaultItem[];
  allowedTypes: readonly VaultType[];
  addLabel: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<VaultType>(allowedTypes[0]);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let uploaded: { storagePath: string; fileName: string; fileSize: number } | null = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "vault");
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
        const json = await res.json();
        uploaded = { storagePath: json.storagePath, fileName: json.fileName, fileSize: json.fileSize };
      }
      await createVaultItem({ title, type, content, tags }, uploaded);
      setTitle("");
      setContent("");
      setTags("");
      setFile(null);
      toast.success("Saved to vault");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function onDownload(storagePath: string) {
    try {
      window.open(await getVaultItemUrl(storagePath), "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open file");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await deleteVaultItem(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="card-glow relative z-10 space-y-3">
        <h3 className="text-sm font-semibold">{addLabel}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={type} onValueChange={(v) => setType(v as VaultType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {VAULT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea placeholder="Content, prompt text, or notes (optional)" rows={2} value={content} onChange={(e) => setContent(e.target.value)} />
        <Input placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
            <Upload size={14} />
            {file ? file.name : "Attach a file (optional)"}
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <Button onClick={onCreate} disabled={saving || !title.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card-glow relative z-10 py-16 text-center text-sm text-muted-foreground">Nothing here yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="card-glow relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{it.title}</span>
                  <Badge variant="outline">{VAULT_TYPE_LABELS[it.type as VaultType] ?? it.type}</Badge>
                </div>
                {it.content && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{it.content}</p>}
                {it.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {it.tags.map((t) => (
                      <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {it.fileUrl && (
                  <Button size="sm" variant="ghost" onClick={() => onDownload(it.fileUrl!)}>
                    <Download size={14} />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(it.id)}>
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

export function VaultSearchBar({ basePath, q, type, types }: { basePath: string; q?: string; type?: string; types: readonly string[] }) {
  return (
    <form className="flex flex-wrap gap-2" action={basePath}>
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title, content, tags…"
          className="h-9 w-64 rounded-lg border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground"
        />
      </div>
      <a href={basePath} className={`flex items-center rounded-lg border border-input px-3 text-sm ${!type ? "bg-secondary" : "text-muted-foreground"}`}>
        All
      </a>
      {types.map((t) => (
        <a
          key={t}
          href={`${basePath}?type=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={`flex items-center rounded-lg border border-input px-3 text-sm ${type === t ? "bg-secondary" : "text-muted-foreground"}`}
        >
          {VAULT_TYPE_LABELS[t as keyof typeof VAULT_TYPE_LABELS] ?? t}
        </a>
      ))}
    </form>
  );
}
