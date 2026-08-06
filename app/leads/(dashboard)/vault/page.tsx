import { db } from "@/lib/db";
import VaultBrowser, { VaultSearchBar } from "@/components/leads/VaultBrowser";
import { VAULT_ITEM_TYPES } from "@/lib/validations/vault";
import type { VaultItemType } from "@/lib/generated/prisma/enums";

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;

  const items = await db.vaultItem.findMany({
    where: {
      ...(type ? { type: type as VaultItemType } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
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
        <h1 className="text-2xl font-semibold">Knowledge Vault</h1>
        <p className="text-sm text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"} · files, prompts, research, notes</p>
      </div>
      <VaultSearchBar basePath="/leads/vault" q={q} type={type} types={VAULT_ITEM_TYPES} />
      <VaultBrowser
        addLabel="Save to vault"
        allowedTypes={VAULT_ITEM_TYPES}
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
