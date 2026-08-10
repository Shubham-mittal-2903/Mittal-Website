// Pure math shared by the college attendance calculators — no DB/framework deps so it's
// trivially testable and reusable from both server components and the AI assistant.

export function attendancePct(attended: number, total: number): number {
  if (total <= 0) return 0;
  return (attended / total) * 100;
}

// How many upcoming classes can be skipped (counted in total, not attended) before
// attendance drops below the minimum.
export function classesCanMiss(attended: number, total: number, minPct: number): number {
  const min = minPct / 100;
  if (min <= 0) return Infinity;
  const x = attended / min - total;
  return Math.max(0, Math.floor(x));
}

// How many consecutive classes must be attended (counted in both attended and total) to
// reach the minimum, starting from below it.
export function classesNeedToAttend(attended: number, total: number, minPct: number): number {
  const min = minPct / 100;
  if (min >= 1) return Infinity;
  const y = (min * total - attended) / (1 - min);
  return Math.max(0, Math.ceil(y));
}

// Same question as classesNeedToAttend/classesCanMiss, but bounded by a fixed semester total
// instead of assuming an infinite number of future classes. Returns null for needToAttend when
// even attending every remaining class can't reach the minimum by semester end.
export function semesterAttendanceProjection(
  attended: number,
  heldSoFar: number,
  semesterTotal: number,
  minPct: number
): { remaining: number; needToAttend: number | null; canMiss: number } {
  const remaining = Math.max(0, semesterTotal - heldSoFar);
  const min = minPct / 100;

  const bestCasePct = semesterTotal > 0 ? (attended + remaining) / semesterTotal : 0;
  if (bestCasePct < min) {
    return { remaining, needToAttend: null, canMiss: 0 };
  }

  const needToAttend = Math.max(0, Math.ceil(min * semesterTotal - attended));
  const canMiss = Math.max(0, remaining - needToAttend);
  return { remaining, needToAttend, canMiss };
}
