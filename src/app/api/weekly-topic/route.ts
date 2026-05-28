import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Subject } from '@prisma/client';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const ALLOWED_SUBJECTS = new Set<Subject>([Subject.SCIENCE, Subject.HISTORY]);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const termId = req.nextUrl.searchParams.get('termId');
  if (!termId) return NextResponse.json({ error: 'termId required' }, { status: 400 });

  const topics = await prisma.weeklyTopic.findMany({
    where: { termId },
    include: { resource: true },
    orderBy: [{ weekNumber: 'asc' }, { subject: 'asc' }],
  });
  return NextResponse.json({ topics });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const termId = String(body.termId ?? '');
  const weekNumber = Number(body.weekNumber);
  const subject = body.subject as Subject;
  const resourceId = String(body.resourceId ?? '');
  const notes = body.notes ? String(body.notes) : null;

  if (!termId || !weekNumber || !subject || !resourceId) {
    return NextResponse.json({ error: 'termId, weekNumber, subject, resourceId required' }, { status: 400 });
  }
  if (!ALLOWED_SUBJECTS.has(subject)) {
    return NextResponse.json({ error: 'subject must be SCIENCE or HISTORY' }, { status: 400 });
  }
  if (!Number.isInteger(weekNumber) || weekNumber < 1) {
    return NextResponse.json({ error: 'weekNumber must be a positive integer' }, { status: 400 });
  }

  const resource = await prisma.curriculumResource.findUnique({ where: { id: resourceId } });
  if (!resource || !resource.active) return NextResponse.json({ error: 'resource not found' }, { status: 404 });

  const topic = await prisma.weeklyTopic.upsert({
    where: { termId_weekNumber_subject: { termId, weekNumber, subject } },
    update: { resourceId, notes, selectedBy: session.user.email },
    create: { termId, weekNumber, subject, resourceId, notes, selectedBy: session.user.email },
    include: { resource: true },
  });

  await audit({
    userId: null,
    action: 'weekly-topic.upsert',
    entityType: 'WeeklyTopic',
    entityId: topic.id,
    payload: { termId, weekNumber, subject, resourceId },
  });

  return NextResponse.json({ topic });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const termId = sp.get('termId');
  const weekNumber = sp.get('weekNumber') ? parseInt(sp.get('weekNumber')!, 10) : null;
  const subject = sp.get('subject') as Subject | null;

  if (!termId || !weekNumber || !subject) {
    return NextResponse.json({ error: 'termId, weekNumber, subject required' }, { status: 400 });
  }

  const deleted = await prisma.weeklyTopic.deleteMany({
    where: { termId, weekNumber, subject },
  });

  await audit({
    userId: null,
    action: 'weekly-topic.delete',
    entityType: 'WeeklyTopic',
    payload: { termId, weekNumber, subject, count: deleted.count },
  });

  return NextResponse.json({ deleted: deleted.count });
}
