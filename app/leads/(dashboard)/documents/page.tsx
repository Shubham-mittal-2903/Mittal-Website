import { db } from "@/lib/db";
import VaultBrowser, { VaultSearchBar } from "@/components/leads/VaultBrowser";
import { DOCUMENT_TYPES } from "@/lib/validations/vault";
import type { VaultItemType } from "@/lib/generated/prisma/enums";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;

  const items = await db.vaultItem.findMany({
    where: {
      type: type ? (type as VaultItemType) : { in: [...DOCUMENT_TYPES] },
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">{items.length} file{items.length === 1 ? "" : "s"}</p>
      </div>
      <VaultSearchBar basePath="/leads/documents" q={q} type={type} types={DOCUMENT_TYPES} />
      <VaultBrowser
        addLabel="Upload a document"
        allowedTypes={DOCUMENT_TYPES}
        items={items.map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type,
          content: i.content,
          fileUrl: i.fileUrl,
          fileName: i.fileName,
          tags: i.tags,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
