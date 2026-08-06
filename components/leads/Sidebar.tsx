"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav-items";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-strong sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border p-4 lg:flex">
      <div className="px-2 py-3 font-display text-lg font-semibold">MITTAL OS</div>
      <nav className="mt-2 flex flex-1 flex-col gap-4">
        {NAV_GROUPS.map((group, i) => (
          <div key={group.label ?? `ungrouped-${i}`} className="flex flex-col gap-1">
            {group.label && (
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const active =
                item.href === "/leads" ? pathname === "/leads" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
