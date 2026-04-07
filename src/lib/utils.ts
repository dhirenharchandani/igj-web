import { format, parseISO, isToday, isYesterday, differenceInCalendarDays } from 'date-fns';
import type { ScorecardEntry } from './types';

export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMM d');
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

export function formatFullDate(): string {
  return format(new Date(), 'EEE d MMM');
}

export function calculateStreak(entries: { entry_date: string; morning: { completed: boolean }; evening: { completed: boolean } }[]): number {
  if (!entries.length) return 0;
  const sorted = [...entries].sort(
    (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < sorted.length; i++) {
    const entryDate = parseISO(sorted[i].entry_date);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (differenceInCalendarDays(expected, entryDate) !== 0) break;
    if (sorted[i].morning.completed || sorted[i].evening.completed) streak++;
    else break;
  }
  return streak;
}

export function scorecardTotal(sc: ScorecardEntry): number {
  return sc.awareness + sc.intention + sc.state + sc.presence + sc.ownership + sc.authenticity;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return crypto.randomUUID();
}

/** Returns the Monday (YYYY-MM-DD) of the week containing `date`. */
export function getWeekStart(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return format(d, 'yyyy-MM-dd');
}

/** e.g. "Mar 24 – Mar 30, 2026" */
export function formatWeekRange(weekStart: string): string {
  const start = parseISO(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}
