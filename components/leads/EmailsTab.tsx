"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Check, X } from "lucide-react";
import { createEmailDraft, createEmailHistoryEntry, toggleEmailHistoryFlag, createFollowupEntry } from "@/lib/actions/emails";
import { EMAIL_DRAFT_STATUSES, FOLLOWUP_STATUSES } from "@/lib/validations/emails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type EmailDraft = {
  id: string;
  version: string;
  status: string;
  subjectFinal: string | null;
  body: string;
  bestSendTimeProspectLocal: string | null;
  bestSendTimeIst: string | null;
};
type EmailHistoryEntry = {
  id: string;
  date: Date;
  subject: string;
  status: string;
  opened: boolean;
  replied: boolean;
};
type FollowupEntry = {
  id: string;
  channel: string | null;
  scheduledDate: Date | null;
  status: string;
  notes: string | null;
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

function DraftsSection({ leadId, drafts }: { leadId: string; drafts: EmailDraft[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState("v1");
  const [status, setStatus] = useState("DRAFT");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!body.trim()) return;
    setSaving(true);
    try {
      await createEmailDraft(leadId, { version, status: status as (typeof EMAIL_DRAFT_STATUSES)[number], subjectFinal: subject || undefined, body });
      setVersion("v1");
      setStatus("DRAFT");
      setSubject("");
      setBody("");
      setOpen(false);
      toast.success("Draft added");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add draft");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-glow relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Drafts</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus size={14} />
              Add Draft
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Email Draft</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Version (v1, v2, final)" value={version} onChange={(e) => setVersion(e.target.value)} />
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_DRAFT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Textarea placeholder="Email body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={saving}>
                {saving ? "Saving…" : "Save Draft"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {drafts.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No drafts yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {drafts.map((d) => (
            <div key={d.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{d.version}</span>
                <Badge variant="outline">{d.status}</Badge>
              </div>
              {d.subjectFinal && <p className="mt-1 text-sm text-muted-foreground">{d.subjectFinal}</p>}
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.body}</p>
              {d.bestSendTimeIst && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Best time to send: <span className="text-foreground">{d.bestSendTimeIst}</span>
                  {d.bestSendTimeProspectLocal && ` (prospect local: ${d.bestSendTimeProspectLocal})`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistorySection({ leadId, entries }: { leadId: string; entries: EmailHistoryEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState("Sent");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!subject.trim()) return;
    setSaving(true);
    try {
      await createEmailHistoryEntry(leadId, { date, subject, status });
      setSubject("");
      setOpen(false);
      toast.success("Logged");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log email");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string, field: "opened" | "replied", value: boolean) {
    try {
      await toggleEmailHistoryFlag(id, leadId, field, value);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  return (
    <div className="card-glow relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">History</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus size={14} />
              Log Email
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Sent Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Input placeholder="Status (e.g. Sent, Draft created)" value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={saving}>
                {saving ? "Saving…" : "Log"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No email history yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium">{e.subject}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(e.date)} · {e.status}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => toggle(e.id, "opened", !e.opened)}
                  className={`rounded-full p-1.5 ${e.opened ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                  title="Opened"
                >
                  {e.opened ? <Check size={13} /> : <X size={13} />}
                </button>
                <button
                  onClick={() => toggle(e.id, "replied", !e.replied)}
                  className={`rounded-full p-1.5 ${e.replied ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
                  title="Replied"
                >
                  {e.replied ? <Check size={13} /> : <X size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FollowupsSection({ leadId, followups }: { leadId: string; followups: FollowupEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState("SCHEDULED");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await createFollowupEntry(leadId, {
        channel: channel || undefined,
        scheduledDate: scheduledDate || undefined,
        status: status as (typeof FOLLOWUP_STATUSES)[number],
        notes: notes || undefined,
      });
      setChannel("");
      setScheduledDate("");
      setNotes("");
      setOpen(false);
      toast.success("Follow-up scheduled");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to schedule follow-up");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-glow relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Follow-ups</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus size={14} />
              Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Follow-up</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Channel (email, WhatsApp, call)" value={channel} onChange={(e) => setChannel(e.target.value)} />
              <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOWUP_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea placeholder="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={saving}>
                {saving ? "Saving…" : "Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {followups.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No follow-ups scheduled yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {followups.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium">{f.channel ?? "Follow-up"}</div>
                {f.notes && <div className="text-xs text-muted-foreground">{f.notes}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{f.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  {f.scheduledDate ? formatDate(f.scheduledDate) : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmailsTab({
  leadId,
  drafts,
  history,
  followups,
}: {
  leadId: string;
  drafts: EmailDraft[];
  history: EmailHistoryEntry[];
  followups: FollowupEntry[];
}) {
  return (
    <div className="space-y-6">
      <DraftsSection leadId={leadId} drafts={drafts} />
      <HistorySection leadId={leadId} entries={history} />
      <FollowupsSection leadId={leadId} followups={followups} />
    </div>
  );
}
