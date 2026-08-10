// Pure math for "does this scheduled slot occur on date D" — mirrors lib/attendance.ts's
// no-framework-deps style so it's usable from both server components and Jayden's tool layer.

export function occursOnDate(
  slot: { dayOfWeek: number; alternateWeek: boolean; alternateWeekAnchorDate: Date | null },
  date: Date
): boolean {
  if (date.getUTCDay() !== slot.dayOfWeek) return false;
  if (!slot.alternateWeek) return true;
  if (!slot.alternateWeekAnchorDate) return true; // no anchor recorded — assume it occurs, don't silently drop it

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const anchor = Date.UTC(
    slot.alternateWeekAnchorDate.getUTCFullYear(),
    slot.alternateWeekAnchorDate.getUTCMonth(),
    slot.alternateWeekAnchorDate.getUTCDate()
  );
  const target = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const weeksBetween = Math.round((target - anchor) / msPerWeek);
  return weeksBetween % 2 === 0;
}
