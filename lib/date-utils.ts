// MITTAL OS has exactly one user, in India (IST, UTC+5:30, no DST) — but this code runs on
// whatever timezone the Node process happens to be in: locally, whatever the machine is set
// to; on Vercel, UTC by default. Every "what day is it" / "store this calendar date"
// computation MUST go through here. The bug this fixes: `new Date().setHours(0,0,0,0)`
// zeroes in the SERVER's local time, which for a positive-UTC-offset zone like IST rolls the
// stored UTC instant back onto the PREVIOUS calendar day — silently corrupting every
// @db.Date column it touches (AttendanceEntry.date, Transaction.date, Budget.month,
// PrepTarget.date, DailyReport.date) and skewing "today" range-query boundaries by up to
// 5.5 hours near the IST/UTC day boundary.

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

// The current moment, shifted so its UTC getters (getUTCFullYear/getUTCMonth/getUTCDate/...)
// report IST wall-clock values. Not a real instant on its own — only ever read via getUTC*.
function istNow(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

// Safe to write to a Postgres @db.Date column: its UTC calendar date is exactly Y-M-D
// (month is 0-indexed, matching JS Date convention), regardless of server timezone.
export function dateOnly(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

export function todayDateOnly(): Date {
  const ist = istNow();
  return dateOnly(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
}

// "YYYY-MM-DD" (e.g. from a form field or Jayden tool input) parses natively as UTC
// midnight — already safe for @db.Date storage, this just validates it.
export function parseDateOnly(dateStr: string): Date {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: "${dateStr}"`);
  return d;
}

export function dateOnlyKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayKey(): string {
  return dateOnlyKey(todayDateOnly());
}

// [start, end) window in IST for range queries against DateTime columns, e.g.
// `{ dueDate: { gte: start, lt: end } }` for "due today". daysFromToday shifts the window.
export function istDayRange(daysFromToday = 0): { start: Date; end: Date } {
  const start = todayDateOnly();
  start.setUTCDate(start.getUTCDate() + daysFromToday);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export function addDaysToDateOnly(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Monday that starts the IST week containing "today + daysFromToday".
export function startOfIstWeek(daysFromToday = 0): Date {
  const t = todayDateOnly();
  t.setUTCDate(t.getUTCDate() + daysFromToday);
  const day = t.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  t.setUTCDate(t.getUTCDate() + diff);
  return t;
}
