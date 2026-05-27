import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '60'), 365);

  const reflections = await prisma.reflection.findMany({
    include: { child: true, author: { select: { email: true, name: true } } },
    orderBy: { date: 'desc' },
    take: limit,
  });

  return NextResponse.json({ reflections });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const reflection = await prisma.reflection.create({
    data: {
      authorId: (session.user as any).id,
      childId: body.childId || null,
      date: new Date(body.date),
      whatWorked: body.whatWorked,
      whatDidnt: body.whatDidnt,
      tomorrowAdjust: body.tomorrowAdjust,
      mood: body.mood,
      energyLevel: body.energyLevel,
      tags: body.tags ?? [],
    },
  });

  await audit({
    userId: (session.user as any).id,
    action: 'reflection.create',
    entityType: 'Reflection',
    entityId: reflection.id,
  });

  return NextResponse.json({ reflection });
}
