"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

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
      <div className="hidden items-center gap-3 lg:flex">
        {email && (
          <div className="flex items-center gap-2">
            <span className="bg-brand-gradient flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white shadow-[0_0_10px_hsl(158_55%_25%/0.5)]">
              {email.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
        )}
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
