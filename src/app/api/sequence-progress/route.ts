import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { LessonStatus } from '@prisma/client';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET — return one row per active SequenceAssignment, including the current
// SequenceEntry (next-to-do) and the next-next entry (so the UI can preview
// what's coming). Filter by ?childId=... to scope to one child.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const childId = req.nextUrl.searchParams.get('childId');
  const where = childId ? { childId, completedAt: null } : { completedAt: null };

  const assignments = await prisma.sequenceAssignment.findMany({
    where,
    include: { sequence: true, child: true },
  });

  const rows = await Promise.all(
    assignments.map(async (a) => {
      const current = a.currentEntryId
        ? await prisma.sequenceEntry.findUnique({ where: { id: a.currentEntryId } })
        : await prisma.sequenceEntry.findFirst({
            where: { sequenceId: a.sequenceId },
            orderBy: { orderIndex: 'asc' },
          });
      const next = current
        ? await prisma.sequenceEntry.findFirst({
            where: { sequenceId: a.sequenceId, orderIndex: { gt: current.orderIndex } },
            orderBy: { orderIndex: 'asc' },
          })
        : null;
      const total = await prisma.sequenceEntry.count({ where: { sequenceId: a.sequenceId } });
      return {
        assignmentId: a.id,
        childId: a.childId,
        childName: a.child.name,
        sequenceId: a.sequenceId,
        sequenceName: a.sequence.name,
        subject: a.sequence.subject,
        current,
        next,
        progress: current ? { done: current.orderIndex - 1, total } : { done: 0, total },
      };
    }),
  );

  return NextResponse.json({ rows });
}

// POST — log a sequence entry complete: optionally creates a Lesson row,
// then advances `currentEntryId` to the next entry (or completes the
// assignment if there is no next).
//
// Body: { assignmentId: string, status?: LessonStatus, durationMin?: number,
//         difficulty?: number, notes?: string, date?: ISO string }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  const body = await req.json();
  const assignmentId = String(body.assignmentId ?? '');
  if (!assignmentId) return NextResponse.json({ error: 'assignmentId required' }, { status: 400 });

  const lessonStatus = (body.status ?? LessonStatus.COMPLETED) as LessonStatus;
  const durationMin = body.durationMin ? Number(body.durationMin) : null;
  const difficulty = body.difficulty ? Number(body.difficulty) : null;
  const notes = body.notes ? String(body.notes) : null;
  const date = body.date ? new Date(body.date) : new Date();

  const assignment = await prisma.sequenceAssignment.findUnique({
    where: { id: assignmentId },
    include: { sequence: true },
  });
  if (!assignment) return NextResponse.json({ error: 'assignment not found' }, { status: 404 });

  const current = assignment.currentEntryId
    ? await prisma.sequenceEntry.findUnique({ where: { id: assignment.currentEntryId } })
    : await prisma.sequenceEntry.findFirst({
        where: { sequenceId: assignment.sequenceId },
        orderBy: { orderIndex: 'asc' },
      });
  if (!current) return NextResponse.json({ error: 'no entries in sequence' }, { status: 400 });

  // Create the Lesson row for portfolio tracking
  const lesson = await prisma.lesson.create({
    data: {
      childId: assignment.childId,
      recorderId: user.id,
      subject: assignment.sequence.subject,
      curriculum: assignment.sequence.name,
      lessonRef: current.lessonRef,
      topic: current.topic,
      date,
      durationMin,
      status: lessonStatus,
      difficulty,
      notes,
    },
  });

  // Advance pointer
  const next = await prisma.sequenceEntry.findFirst({
    where: { sequenceId: assignment.sequenceId, orderIndex: { gt: current.orderIndex } },
    orderBy: { orderIndex: 'asc' },
  });

  const updated = await prisma.sequenceAssignment.update({
    where: { id: assignmentId },
    data: next
      ? { currentEntryId: next.id }
      : { currentEntryId: null, completedAt: new Date() },
  });

  await audit({
    userId: user.id,
    action: 'sequence-progress.advance',
    entityType: 'SequenceAssignment',
    entityId: assignmentId,
    payload: { from: current.id, to: next?.id ?? null, lessonId: lesson.id },
  });

  return NextResponse.json({
    lesson,
    assignment: updated,
    nextEntry: next,
    completed: !next,
  });
}
