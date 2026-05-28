import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildIcs, familyContentDates, FAMILY_CONTENT_DURATION } from '@/lib/ical';

export const dynamic = 'force-dynamic';

// Public-but-unguessable feed. The token in the URL IS the auth. Anyone with
// the URL gets read access; rotate via POST /api/ical/setup { rotate: true }.
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const user = await prisma.user.findUnique({ where: { icalToken: params.token } });
  if (!user) return new NextResponse('Not Found', { status: 404 });

  const [topics, lessons] = await Promise.all([
    prisma.weeklyTopic.findMany({
      include: { resource: true, term: true },
      orderBy: [{ termId: 'asc' }, { weekNumber: 'asc' }],
    }),
    prisma.lesson.findMany({
      include: { child: true },
      orderBy: { date: 'desc' },
      take: 200,
    }),
  ]);

  const events = [];

  for (const t of topics) {
    if (t.subject !== 'SCIENCE' && t.subject !== 'HISTORY') continue;
    const dates = familyContentDates(new Date(t.term.startDate), t.weekNumber, t.subject);
    for (const start of dates) {
      events.push({
        uid: `weekly-topic-${t.id}-${start.toISOString()}@atozfamily.org`,
        start,
        durationMin: FAMILY_CONTENT_DURATION,
        title: `${t.subject === 'SCIENCE' ? 'Science' : 'History'}: ${t.resource.title}`,
        description: [
          t.resource.framework ? `Framework: ${t.resource.framework}` : null,
          t.resource.materials?.length ? `Materials: ${t.resource.materials.slice(0, 5).join(', ')}` : null,
          t.notes ?? null,
        ].filter(Boolean).join('\n') || undefined,
        location: t.resource.fieldTripLocation ?? undefined,
      });
    }
  }

  for (const l of lessons) {
    events.push({
      uid: `lesson-${l.id}@atozfamily.org`,
      start: new Date(l.date),
      durationMin: l.durationMin ?? 30,
      title: `${l.child.name}: ${l.curriculum} ${l.lessonRef}`,
      description: l.topic ? `${l.topic}${l.notes ? '\n\n' + l.notes : ''}` : (l.notes ?? undefined),
    });
  }

  const ics = buildIcs(events, `atozfamily planner — ${user.name ?? user.email}`);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'cache-control': 'private, max-age=300',
      'content-disposition': 'inline; filename="atozfamily-planner.ics"',
    },
  });
}
