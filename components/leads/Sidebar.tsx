"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav-items";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-strong sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border p-4 lg:flex">
      <div className="flex items-center gap-2.5 px-2 py-3">
        <span className="bg-brand-gradient h-2 w-2 shrink-0 rounded-full shadow-[0_0_12px_hsl(158_55%_35%/0.5)]" />
        <span className="font-display text-lg font-semibold tracking-tight">MITTAL OS</span>
      </div>
      <nav className="mt-2 flex flex-1 flex-col gap-4">
        {NAV_GROUPS.map((group, i) => (
          <div key={group.label ?? `ungrouped-${i}`} className="flex flex-col gap-0.5">
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
                    "relative flex items-center gap-3 rounded-lg py-2 pl-3.5 pr-3 text-sm transition-all duration-200",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:translate-x-0.5 hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {active && (
                    <span className="bg-brand-gradient absolute -left-1 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full" />
                  )}
                  <item.icon size={17} className={active ? "text-foreground" : ""} />
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
