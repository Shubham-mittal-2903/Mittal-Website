"use client";

import { useRouter } from "next/navigation";
import { markAttendance } from "@/lib/actions/college";
import { classesCanMiss, classesNeedToAttend } from "@/lib/attendance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type SubjectAttendance = {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  minAttendancePct: number;
};

export function AttendanceStat({ subject }: { subject: SubjectAttendance }) {
  const pct = subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;
  const canMiss = classesCanMiss(subject.attendedClasses, subject.totalClasses, subject.minAttendancePct);
  const needToAttend = classesNeedToAttend(subject.attendedClasses, subject.totalClasses, subject.minAttendancePct);
  const short = pct < subject.minAttendancePct;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge variant={short ? "destructive" : "default"}>{pct.toFixed(1)}%</Badge>
      {short ? (
        <span className="text-muted-foreground">Attend next {needToAttend} to hit {subject.minAttendancePct}%</span>
      ) : (
        <span className="text-muted-foreground">Can miss next {canMiss} and stay above {subject.minAttendancePct}%</span>
      )}
    </div>
  );
}

export function MarkAttendanceButtons({ subjectId }: { subjectId: string }) {
  const router = useRouter();

  async function mark(value: "PRESENT" | "ABSENT" | "CANCELLED") {
    await markAttendance(subjectId, value);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => mark("PRESENT")}>
        Present
      </Button>
      <Button size="sm" variant="outline" onClick={() => mark("ABSENT")}>
        Absent
      </Button>
      <Button size="sm" variant="ghost" onClick={() => mark("CANCELLED")}>
        Cancelled
      </Button>
    </div>
  );
}
