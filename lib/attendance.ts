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
