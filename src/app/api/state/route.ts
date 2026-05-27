import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { audit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const state = await prisma.plannerState.findUnique({ where: { id: 'default' } });
  const children = await prisma.child.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });
  const terms = await prisma.term.findMany({ orderBy: { startDate: 'asc' } });
  const termProgress = await prisma.termProgress.findMany();

  return NextResponse.json({
    plannerState: state?.state ?? null,
    children,
    terms,
    termProgress,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();

  await prisma.plannerState.upsert({
    where: { id: 'default' },
    update: { state: body.state, updatedBy: session.user.email },
    create: { id: 'default', state: body.state, updatedBy: session.user.email },
  });

  await audit({
    userId: (session.user as any).id,
    action: 'state.update',
    entityType: 'PlannerState',
    entityId: 'default',
  });

  return NextResponse.json({ ok: true });
}
