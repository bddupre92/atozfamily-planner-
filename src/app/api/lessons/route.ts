import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { audit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get('childId') ?? undefined;
  const subject = searchParams.get('subject') ?? undefined;
  const since = searchParams.get('since');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '200'), 1000);

  const lessons = await prisma.lesson.findMany({
    where: {
      ...(childId && { childId }),
      ...(subject && { subject: subject as any }),
      ...(since && { date: { gte: new Date(since) } }),
    },
    include: { child: true, recorder: { select: { email: true, name: true } } },
    orderBy: { date: 'desc' },
    take: limit,
  });

  return NextResponse.json({ lessons });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();

  // Derive term from date
  const lessonDate = new Date(body.date);
  const term = await prisma.term.findFirst({
    where: { startDate: { lte: lessonDate }, endDate: { gte: lessonDate } },
  });

  const lesson = await prisma.lesson.create({
    data: {
      childId: body.childId,
      recorderId: (session.user as any).id,
      termId: term?.id,
      subject: body.subject,
      curriculum: body.curriculum,
      lessonRef: body.lessonRef,
      topic: body.topic,
      date: lessonDate,
      durationMin: body.durationMin,
      status: body.status ?? 'COMPLETED',
      difficulty: body.difficulty,
      notes: body.notes,
    },
  });

  // Increment term progress lessonsComplete counter
  if (term && body.status !== 'ABANDONED') {
    await prisma.termProgress.upsert({
      where: { termId_childId: { termId: term.id, childId: body.childId } },
      update: { lessonsComplete: { increment: 1 } },
      create: { termId: term.id, childId: body.childId, lessonsComplete: 1 },
    });
  }

  await audit({
    userId: (session.user as any).id,
    action: 'lesson.create',
    entityType: 'Lesson',
    entityId: lesson.id,
    payload: { subject: body.subject, curriculum: body.curriculum, lessonRef: body.lessonRef },
  });

  return NextResponse.json({ lesson });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await prisma.lesson.delete({ where: { id } });

  // Decrement term progress if applicable
  if (lesson.termId && lesson.status !== 'ABANDONED') {
    await prisma.termProgress.updateMany({
      where: { termId: lesson.termId, childId: lesson.childId },
      data: { lessonsComplete: { decrement: 1 } },
    });
  }

  await audit({
    userId: (session.user as any).id,
    action: 'lesson.delete',
    entityType: 'Lesson',
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
