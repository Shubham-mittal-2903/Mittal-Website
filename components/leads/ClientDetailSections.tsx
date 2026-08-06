"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createProposal, createContract, createInvoice } from "@/lib/actions/clients";
import {
  PROPOSAL_PACKAGES,
  PROPOSAL_STATUSES,
  CONTRACT_STATUSES,
  INVOICE_STATUSES,
} from "@/lib/validations/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Proposal = { id: string; package: string; priceMin: string | null; priceMax: string | null; status: string };
type Contract = { id: string; value: string | null; status: string };
type Invoice = { id: string; invoiceNumber: string; amount: string; status: string; dueAt: Date | null };

function money(v: string | number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "USD" }).format(Number(v));
}

function ProposalsSection({ clientId, leadId, proposals }: { clientId: string; leadId: string | null; proposals: Proposal[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pkg, setPkg] = useState("LAUNCH");
  const [status, setStatus] = useState("DRAFT");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!leadId) return;
    setSaving(true);
    try {
      await createProposal(leadId, clientId, {
        package: pkg as (typeof PROPOSAL_PACKAGES)[number],
        status: status as (typeof PROPOSAL_STATUSES)[number],
        priceMin: priceMin || undefined,
        priceMax: priceMax || undefined,
      });
      setOpen(false);
      toast.success("Proposal added");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add proposal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-glow relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Proposals</h3>
        {leadId ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus size={14} />
                Add Proposal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Proposal</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Select value={pkg} onValueChange={setPkg}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_PACKAGES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Price min" type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                  <Input placeholder="Price max" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={submit} disabled={saving}>
                  {saving ? "Saving…" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <span className="text-xs text-muted-foreground">No linked lead — proposals need a lead reference.</span>
        )}
      </div>

      {proposals.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No proposals yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {proposals.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm font-medium">{p.package}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {money(p.priceMin)} – {money(p.priceMax)}
                </span>
                <Badge variant="outline">{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContractsSection({ clientId, contracts }: { clientId: string; contracts: Contract[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await createContract(clientId, { value: value || undefined, status: status as (typeof CONTRACT_STATUSES)[number] });
      setOpen(false);
      toast.success("Contract added");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add contract");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-glow relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Contracts</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus size={14} />
              Add Contract
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={saving}>
                {saving ? "Saving…" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {contracts.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No contracts yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {contracts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm font-medium">{money(c.value)}</span>
              <Badge variant="outline">{c.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvoicesSection({ clientId, clientName, invoices }: { clientId: string; clientName: string; invoices: Invoice[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!amount) return;
    setSaving(true);
    try {
      await createInvoice(clientId, clientName, {
        amount,
        status: status as (typeof INVOICE_STATUSES)[number],
        dueAt: dueAt || undefined,
      });
      setOpen(false);
      setAmount("");
      toast.success("Invoice created");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-glow relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Invoices</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus size={14} />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input type="date" placeholder="Due date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={saving}>
                {saving ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {invoices.length === 0 ? (
        <p className="relative z-10 text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <div className="relative z-10 space-y-2">
          {invoices.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium">{i.invoiceNumber}</div>
                <div className="text-xs text-muted-foreground">{money(i.amount)}</div>
              </div>
              <Badge variant={i.status === "PAID" ? "default" : "outline"}>{i.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientDetailSections({
  clientId,
  clientName,
  leadId,
  proposals,
  contracts,
  invoices,
}: {
  clientId: string;
  clientName: string;
  leadId: string | null;
  proposals: Proposal[];
  contracts: Contract[];
  invoices: Invoice[];
}) {
  return (
    <div className="space-y-6">
      <ProposalsSection clientId={clientId} leadId={leadId} proposals={proposals} />
      <ContractsSection clientId={clientId} contracts={contracts} />
      <InvoicesSection clientId={clientId} clientName={clientName} invoices={invoices} />
    </div>
  );
}
