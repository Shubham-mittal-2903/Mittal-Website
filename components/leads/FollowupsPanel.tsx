"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type FollowupItem = {
  id: string;
  channel: string | null;
  scheduledDate: Date | null;
  lead: { id: string; company: string; leadNumber: number };
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

function FollowupRow({ item }: { item: FollowupItem }) {
  return (
    <Link
      href={`/leads/all/${item.lead.id}`}
      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent"
    >
      <div>
        <div className="text-sm font-medium">{item.lead.company}</div>
        {item.channel && <div className="text-xs text-muted-foreground">{item.channel}</div>}
      </div>
      <span className="text-xs text-muted-foreground">
        {item.scheduledDate ? formatDate(item.scheduledDate) : "—"}
      </span>
    </Link>
  );
}

export default function FollowupsPanel({
  overdue,
  upcoming,
}: {
  overdue: FollowupItem[];
  upcoming: FollowupItem[];
}) {
  const [open, setOpen] = useState(false);
  const total = overdue.length + upcoming.length;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <CalendarClock size={15} />
        Follow-ups
        {total > 0 && <Badge variant="secondary">{total}</Badge>}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Follow-ups</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-6 overflow-y-auto">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-destructive">
                Overdue {overdue.length > 0 && `(${overdue.length})`}
              </h3>
              {overdue.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing overdue.</p>
              ) : (
                <div className="space-y-1">
                  {overdue.map((f) => (
                    <FollowupRow key={f.id} item={f} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Upcoming {upcoming.length > 0 && `(${upcoming.length})`}
              </h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
              ) : (
                <div className="space-y-1">
                  {upcoming.map((f) => (
                    <FollowupRow key={f.id} item={f} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
