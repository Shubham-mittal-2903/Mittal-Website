"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markAttendance } from "@/lib/actions/college";
import { classesCanMiss, classesNeedToAttend, semesterAttendanceProjection } from "@/lib/attendance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type SubjectAttendance = {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  minAttendancePct: number;
  semesterTotalClasses?: number | null;
};

export function AttendanceStat({ subject }: { subject: SubjectAttendance }) {
  const pct = subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;
  const canMiss = classesCanMiss(subject.attendedClasses, subject.totalClasses, subject.minAttendancePct);
  const needToAttend = classesNeedToAttend(subject.attendedClasses, subject.totalClasses, subject.minAttendancePct);
  const short = pct < subject.minAttendancePct;

  const semester =
    subject.semesterTotalClasses != null
      ? semesterAttendanceProjection(subject.attendedClasses, subject.totalClasses, subject.semesterTotalClasses, subject.minAttendancePct)
      : null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge variant={short ? "destructive" : "default"}>{pct.toFixed(1)}%</Badge>
      {short ? (
        <span className="text-muted-foreground">Attend next {needToAttend} to hit {subject.minAttendancePct}%</span>
      ) : (
        <span className="text-muted-foreground">Can miss next {canMiss} and stay above {subject.minAttendancePct}%</span>
      )}
      {semester && (
        <span className="text-muted-foreground">
          ·{" "}
          {semester.needToAttend === null
            ? `Even attending all ${semester.remaining} remaining classes this semester won't reach ${subject.minAttendancePct}%`
            : `${semester.remaining} classes left this semester — can miss ${semester.canMiss} of them and still finish above ${subject.minAttendancePct}%`}
        </span>
      )}
    </div>
  );
}

export function MarkAttendanceButtons({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"PRESENT" | "ABSENT" | "CANCELLED" | null>(null);

  async function mark(value: "PRESENT" | "ABSENT" | "CANCELLED") {
    setPending(value);
    try {
      await markAttendance(subjectId, value);
      toast.success(`Marked ${value.toLowerCase()}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save — something went wrong.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => mark("PRESENT")}>
        {pending === "PRESENT" ? "Saving…" : "Present"}
      </Button>
      <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => mark("ABSENT")}>
        {pending === "ABSENT" ? "Saving…" : "Absent"}
      </Button>
      <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => mark("CANCELLED")}>
        {pending === "CANCELLED" ? "Saving…" : "Cancelled"}
      </Button>
    </div>
  );
}
