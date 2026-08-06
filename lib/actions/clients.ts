"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  clientSchema,
  proposalSchema,
  contractSchema,
  invoiceSchema,
  type ClientInput,
  type ProposalFormInput,
  type ContractFormInput,
  type InvoiceFormInput,
} from "@/lib/validations/clients";

export async function createClientRecord(input: ClientInput) {
  const data = clientSchema.parse(input);
  const client = await db.client.create({
    data: {
      name: data.name,
      company: data.company || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      status: data.status,
      notes: data.notes || undefined,
      leadId: data.leadId || undefined,
    },
  });
  revalidatePath("/leads/clients");
  redirect(`/leads/clients/${client.id}`);
}

export async function updateClientRecord(id: string, input: ClientInput) {
  const data = clientSchema.parse(input);
  await db.client.update({
    where: { id },
    data: {
      name: data.name,
      company: data.company || null,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status,
      notes: data.notes || null,
    },
  });
  revalidatePath(`/leads/clients/${id}`);
  revalidatePath("/leads/clients");
}

export async function createProposal(leadId: string, clientId: string | null, input: ProposalFormInput) {
  const data = proposalSchema.parse(input);
  await db.proposal.create({
    data: {
      leadId,
      clientId: clientId || undefined,
      package: data.package,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      status: data.status,
      content: data.content || undefined,
      sentAt: data.status === "SENT" ? new Date() : undefined,
    },
  });
  if (clientId) revalidatePath(`/leads/clients/${clientId}`);
}

export async function createContract(clientId: string, input: ContractFormInput) {
  const data = contractSchema.parse(input);
  await db.contract.create({
    data: {
      clientId,
      value: data.value,
      status: data.status,
      signedAt: data.status === "SIGNED" ? new Date() : undefined,
    },
  });
  revalidatePath(`/leads/clients/${clientId}`);
}

async function nextInvoiceNumber(clientName: string) {
  const initials = clientName
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 3) || "CL";
  const today = new Date().toISOString().slice(0, 10);
  const prefix = `${today}-${initials}`;
  const count = await db.invoice.count({ where: { invoiceNumber: { startsWith: prefix } } });
  return `${prefix}-${count + 1}`;
}

export async function createInvoice(clientId: string, clientName: string, input: InvoiceFormInput) {
  const data = invoiceSchema.parse(input);
  const invoiceNumber = await nextInvoiceNumber(clientName);
  await db.invoice.create({
    data: {
      clientId,
      invoiceNumber,
      amount: data.amount,
      status: data.status,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      notes: data.notes || undefined,
      issuedAt: new Date(),
      paidAt: data.status === "PAID" ? new Date() : undefined,
    },
  });
  revalidatePath(`/leads/clients/${clientId}`);
  revalidatePath("/leads/analytics");
  revalidatePath("/leads");
}
