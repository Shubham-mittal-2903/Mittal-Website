"use client";

import { Search } from "lucide-react";

export default function TopBar({
  email,
  onSearchClick,
}: {
  email: string | null;
  onSearchClick: () => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-6">
      <button
        onClick={onSearchClick}
        className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Search size={15} />
        Search leads…
        <kbd className="ml-4 hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>
      {email && (
        <span className="hidden text-sm text-muted-foreground lg:inline">{email}</span>
      )}
    </header>
  );
}
