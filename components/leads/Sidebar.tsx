"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav-items";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";

export default function Sidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const initial = email ? email.charAt(0).toUpperCase() : "S";
  const name = email ? email.split("@")[0] : "Shubham";

  return (
    <aside className="glass-strong sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border p-4 lg:flex">
      <div className="flex items-center gap-2.5 px-2 py-3">
        <span className="bg-brand-gradient h-2 w-2 shrink-0 rounded-full shadow-[0_0_12px_hsl(158_55%_35%/0.5)]" />
        <span className="font-display text-lg font-semibold tracking-tight">MITTAL OS</span>
      </div>
      <nav className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto">
        {NAV_GROUPS.map((group, i) => (
          <div key={group.label ?? `ungrouped-${i}`} className="flex flex-col gap-0.5">
            {group.label && (
              <div className="px-3 pb-2 pt-2 font-leads-mono text-[9px] font-medium uppercase tracking-[0.18em] text-foreground/30">
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
                    "relative flex min-h-[38px] items-center gap-3 rounded-[7px] px-3 text-xs font-medium transition-colors duration-150",
                    active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon size={16} className={active ? "text-primary" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-border p-2.5">
        <span className="bg-brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-[0_0_10px_hsl(158_55%_25%/0.5)]">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium capitalize">{name}</p>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70">Founder</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md px-1.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
