import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const resource = await prisma.curriculumResource.findUnique({ where: { id: params.id } });
  if (!resource || !resource.active) return NextResponse.json({ error: 'not-found' }, { status: 404 });

  return NextResponse.json({ resource });
}
