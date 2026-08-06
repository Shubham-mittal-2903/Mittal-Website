"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveAudit, addFinding, deleteFinding } from "@/lib/actions/audits";
import { FINDING_TYPES, FINDING_LABELS, type AuditFormInput } from "@/lib/validations/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { FindingType } from "@/lib/generated/prisma/enums";

type Finding = { id: string; type: string; category: string | null; description: string };
type AuditData = {
  id: string;
  performanceScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  seoScore: number | null;
  performanceObservations: string | null;
  positiveObservations: string | null;
  improvementOpportunities: string | null;
  accessibilityIssues: string | null;
  browserIssues: string | null;
  rawNotes: string | null;
  findings: Finding[];
} | null;

const FINDING_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  POSITIVE: "default",
  GAP: "secondary",
  ISSUE: "destructive",
  NOT_VERIFIED: "outline",
};

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input type="number" min={0} max={100} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function AuditTab({ leadId, audit }: { leadId: string; audit: AuditData }) {
  const router = useRouter();
  const [scores, setScores] = useState({
    performanceScore: audit?.performanceScore?.toString() ?? "",
    accessibilityScore: audit?.accessibilityScore?.toString() ?? "",
    bestPracticesScore: audit?.bestPracticesScore?.toString() ?? "",
    seoScore: audit?.seoScore?.toString() ?? "",
  });
  const [notes, setNotes] = useState({
    performanceObservations: audit?.performanceObservations ?? "",
    positiveObservations: audit?.positiveObservations ?? "",
    improvementOpportunities: audit?.improvementOpportunities ?? "",
    accessibilityIssues: audit?.accessibilityIssues ?? "",
    browserIssues: audit?.browserIssues ?? "",
    rawNotes: audit?.rawNotes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const [findingOpen, setFindingOpen] = useState(false);
  const [findingType, setFindingType] = useState<FindingType>("GAP");
  const [findingCategory, setFindingCategory] = useState("");
  const [findingDesc, setFindingDesc] = useState("");
  const [addingFinding, setAddingFinding] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const input: AuditFormInput = { ...scores, ...notes };
      await saveAudit(leadId, audit?.id ?? null, input);
      toast.success("Audit saved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save audit");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddFinding() {
    if (!audit?.id) {
      toast.error("Save the audit first before adding findings.");
      return;
    }
    if (!findingDesc.trim()) return;
    setAddingFinding(true);
    try {
      await addFinding(audit.id, leadId, {
        type: findingType,
        category: findingCategory || undefined,
        description: findingDesc,
      });
      setFindingDesc("");
      setFindingCategory("");
      setFindingOpen(false);
      toast.success("Finding added");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add finding");
    } finally {
      setAddingFinding(false);
    }
  }

  async function handleDeleteFinding(id: string) {
    try {
      await deleteFinding(id, leadId);
      toast.success("Finding removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove finding");
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-glow relative z-10 space-y-4">
        <h3 className="text-sm font-semibold">Scores</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ScoreField label="Performance" value={scores.performanceScore} onChange={(v) => setScores((s) => ({ ...s, performanceScore: v }))} />
          <ScoreField label="Accessibility" value={scores.accessibilityScore} onChange={(v) => setScores((s) => ({ ...s, accessibilityScore: v }))} />
          <ScoreField label="Best Practices" value={scores.bestPracticesScore} onChange={(v) => setScores((s) => ({ ...s, bestPracticesScore: v }))} />
          <ScoreField label="SEO" value={scores.seoScore} onChange={(v) => setScores((s) => ({ ...s, seoScore: v }))} />
        </div>

        <h3 className="pt-2 text-sm font-semibold">Notes</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["performanceObservations", "Performance Observations"],
              ["positiveObservations", "Positive Observations"],
              ["improvementOpportunities", "Improvement Opportunities"],
              ["accessibilityIssues", "Accessibility Issues"],
              ["browserIssues", "Browser Issues"],
              ["rawNotes", "Other Notes"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground">{label}</label>
              <Textarea
                rows={2}
                value={notes[key]}
                onChange={(e) => setNotes((n) => ({ ...n, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : audit ? "Update Audit" : "Save Audit"}
        </Button>
      </div>

      <div className="card-glow relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Findings</h3>
          <Dialog open={findingOpen} onOpenChange={setFindingOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus size={14} />
                Add Finding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Finding</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Select value={findingType} onValueChange={(v) => setFindingType(v as FindingType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINDING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {FINDING_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Category (optional) — e.g. broken_link, accessibility"
                  value={findingCategory}
                  onChange={(e) => setFindingCategory(e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  rows={3}
                  value={findingDesc}
                  onChange={(e) => setFindingDesc(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddFinding} disabled={addingFinding}>
                  {addingFinding ? "Adding…" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!audit || audit.findings.length === 0 ? (
          <p className="relative z-10 text-sm text-muted-foreground">No findings recorded yet.</p>
        ) : (
          <div className="relative z-10 space-y-2">
            {audit.findings.map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={FINDING_VARIANT[f.type] ?? "outline"}>{FINDING_LABELS[f.type as FindingType] ?? f.type}</Badge>
                    {f.category && <span className="text-xs text-muted-foreground">{f.category}</span>}
                  </div>
                  <p className="mt-1 text-sm">{f.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteFinding(f.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remove finding"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
