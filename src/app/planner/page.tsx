import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { PlannerApp } from '@/components/PlannerApp';

// Auth + DB at request time — never prerender.
export const dynamic = 'force-dynamic';

export default async function PlannerPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/signin?callbackUrl=/planner');

  const now = new Date();
  const [state, childrenList, terms, termProgress, recentLessons, recentReflections, weeklyTopics] =
    await Promise.all([
      prisma.plannerState.findUnique({ where: { id: 'default' } }),
      prisma.child.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } }),
      prisma.term.findMany({ orderBy: { startDate: 'asc' } }),
      prisma.termProgress.findMany(),
      prisma.lesson.findMany({
        include: { child: true },
        orderBy: { date: 'desc' },
        take: 50,
      }),
      prisma.reflection.findMany({
        include: { child: true },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      // Weekly topics for the term containing `now`, or the closest upcoming term.
      // Client-side WeekTab re-derives which week is current and refetches if needed.
      prisma.weeklyTopic.findMany({
        where: {
          term: { startDate: { lte: now }, endDate: { gte: now } },
        },
        include: {
          resource: {
            select: {
              id: true,
              title: true,
              framework: true,
              materials: true,
              fieldTripLocation: true,
            },
          },
        },
      }),
    ]);

  return (
    <PlannerApp
      session={{ email: session.user.email!, name: session.user.name ?? null }}
      initialState={state?.state ?? null}
      childrenList={childrenList}
      terms={JSON.parse(JSON.stringify(terms))}
      termProgress={JSON.parse(JSON.stringify(termProgress))}
      recentLessons={JSON.parse(JSON.stringify(recentLessons))}
      recentReflections={JSON.parse(JSON.stringify(recentReflections))}
      weeklyTopics={JSON.parse(JSON.stringify(weeklyTopics))}
    />
  );
}
