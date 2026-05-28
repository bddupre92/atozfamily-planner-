// Minimal RFC 5545 iCalendar generator. No deps — the spec is plain text.
//
// We expose feeds containing two event types:
//  - WEEKLY TOPICS — one event per (term, week, subject) on the appropriate
//    weekday(s) at the Family Content time slot (11:15-12:00).
//      SCIENCE → Mon + Wed
//      HISTORY → Tue + Thu
//  - LOGGED LESSONS — one event per Lesson row (anchored at the lesson's date
//    field; durationMin is honored if set, else defaults to 30 min).
//
// Output is UTF-8 with CRLF line endings (per RFC). Lines must wrap at 75
// octets when long; we keep titles short to avoid needing fold logic.

type IcsEvent = {
  uid: string;
  start: Date;
  durationMin: number;
  title: string;
  description?: string;
  location?: string;
};

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

// Format Date → "YYYYMMDDTHHMMSSZ" (UTC, as iCal expects for floating events)
function fmtUtc(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildIcs(events: IcsEvent[], calendarName = 'atozfamily planner'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//atozfamily//planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    'X-WR-TIMEZONE:America/Los_Angeles',
  ];
  for (const e of events) {
    const end = new Date(e.start.getTime() + e.durationMin * 60 * 1000);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.uid}`);
    lines.push(`DTSTAMP:${fmtUtc(new Date())}`);
    lines.push(`DTSTART:${fmtUtc(e.start)}`);
    lines.push(`DTEND:${fmtUtc(end)}`);
    lines.push(`SUMMARY:${escapeText(e.title)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Family Content time slot: 11:15 → 12:00 Pacific
const FAMILY_CONTENT_START_HOUR = 11;
const FAMILY_CONTENT_START_MIN = 15;
const FAMILY_CONTENT_DURATION_MIN = 45;

// Compute the Date(s) for a given (termStart, weekNumber, subject) — local-time.
// Week 1 = the calendar week containing the term's startDate. SCIENCE -> Mon+Wed,
// HISTORY -> Tue+Thu. Returns one Date per weekday-occurrence.
export function familyContentDates(termStart: Date, weekNumber: number, subject: 'SCIENCE' | 'HISTORY'): Date[] {
  const weekStart = new Date(termStart.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  // Normalize to Monday of the containing week.
  const dow = weekStart.getDay(); // 0 = Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(weekStart);
  monday.setDate(weekStart.getDate() + mondayOffset);
  monday.setHours(FAMILY_CONTENT_START_HOUR, FAMILY_CONTENT_START_MIN, 0, 0);

  const offsets = subject === 'SCIENCE' ? [0, 2] : [1, 3]; // Mon+Wed vs Tue+Thu
  return offsets.map((off) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + off);
    return d;
  });
}

export const FAMILY_CONTENT_DURATION = FAMILY_CONTENT_DURATION_MIN;
