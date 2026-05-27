import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Subject } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const subject = sp.get('subject') as Subject | null;
  const framework = sp.get('framework');
  const season = sp.get('season');
  const term = sp.get('term');
  const ageMin = sp.get('ageMin') ? parseInt(sp.get('ageMin')!, 10) : null;
  const q = sp.get('q')?.trim().toLowerCase();

  const where: any = { active: true, deletedAt: null };
  if (subject) where.subject = subject;
  if (framework) where.framework = framework;
  if (season) where.season = season;
  if (term) where.termIds = { has: term };
  if (ageMin !== null) where.ageRange = { contains: String(ageMin) };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const resources = await prisma.curriculumResource.findMany({
    where,
    orderBy: [{ framework: 'asc' }, { weekHint: 'asc' }, { title: 'asc' }],
    take: 200,
  });

  return NextResponse.json({ resources });
}
