"use server";

import { db } from "@/lib/db";

export async function searchLeads(query: string) {
  const q = query.trim();
  if (!q) return [];

  const leadNumber = Number(q);

  return db.lead.findMany({
    where: {
      OR: [
        { company: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { industry: { contains: q, mode: "insensitive" } },
        ...(Number.isFinite(leadNumber) ? [{ leadNumber }] : []),
      ],
    },
    select: {
      id: true,
      leadNumber: true,
      company: true,
      industry: true,
      status: true,
      email: true,
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
  });
}
