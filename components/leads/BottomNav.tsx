"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, MoreHorizontal, LogOut } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { signOut } from "@/lib/actions/auth";

const PRIMARY = NAV_ITEMS.slice(0, 3); // Dashboard, Leads CRM, Pipeline
const MORE_LINKS = NAV_ITEMS.slice(3); // everything else, grows automatically as modules ship

export default function BottomNav({ onSearchClick }: { onSearchClick: () => void }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="glass-strong fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border py-2 lg:hidden">
        {PRIMARY.map((item) => {
          const active = item.href === "/leads" ? pathname === "/leads" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[44px] flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px]",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={onSearchClick}
          className="flex min-w-[44px] flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground"
        >
          <Search size={20} />
          Search
        </button>
        <button
          onClick={() => setMoreOpen(true)}
          className="flex min-w-[44px] flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground"
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="flex max-h-[80vh] flex-col pb-8">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto">
            {MORE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-foreground hover:bg-accent"
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-destructive hover:bg-accent"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
