// Term/week math. A term has a startDate and a `weeks` count.
// Week 1 = the calendar week containing startDate.
// Returns null if `now` is before the term starts or after `weeks` have elapsed.

export function currentWeekOfTerm(termStart: Date | string, weeks: number, now: Date = new Date()): number | null {
  const start = typeof termStart === 'string' ? new Date(termStart) : termStart;
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return null;
  const weekZeroBased = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  const week = weekZeroBased + 1;
  if (week > weeks) return null;
  return week;
}

export type TermLite = { id: string; startDate: Date | string; endDate: Date | string; weeks: number };

// Pick the term that contains `now`, or the next upcoming term if between terms,
// or the most recent term if all are past. Returns null only if `terms` is empty.
export function currentOrUpcomingTerm<T extends TermLite>(terms: T[], now: Date = new Date()): T | null {
  if (terms.length === 0) return null;
  const sorted = [...terms].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const containing = sorted.find((t) => {
    const start = new Date(t.startDate).getTime();
    const end = new Date(t.endDate).getTime();
    return now.getTime() >= start && now.getTime() <= end;
  });
  if (containing) return containing;
  const upcoming = sorted.find((t) => new Date(t.startDate).getTime() > now.getTime());
  if (upcoming) return upcoming;
  return sorted[sorted.length - 1];
}
