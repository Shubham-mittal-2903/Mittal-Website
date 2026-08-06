"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { searchLeads } from "@/lib/actions/search";

type SearchResult = Awaited<ReturnType<typeof searchLeads>>[number];

export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      setResults(await searchLeads(query));
    }, 200);
    return () => clearTimeout(handle);
  }, [query, open]);

  const select = useCallback(
    (id: string) => {
      onOpenChange(false);
      router.push(`/leads/all/${id}`);
    },
    [router, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search leads by company, email, phone, industry…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No leads found.</CommandEmpty>
        <CommandGroup heading="Leads">
          {results.map((lead) => (
            <CommandItem key={lead.id} value={lead.id} onSelect={() => select(lead.id)}>
              <span className="font-medium">{lead.company}</span>
              <span className="ml-2 text-muted-foreground">#{lead.leadNumber}</span>
              {lead.industry && (
                <span className="ml-auto text-xs text-muted-foreground">{lead.industry}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
