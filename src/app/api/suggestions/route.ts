import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { SuggestionStatus } from '@prisma/client';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const suggestions = await prisma.suggestion.findMany({
    orderBy: [{ status: 'asc' }, { upvotes: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { email: true, name: true } } },
  });
  return NextResponse.json({ suggestions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const title = (body.title ?? '').trim();
  const text = (body.body ?? '').trim();
  const category = body.category ? String(body.category) : null;

  if (!title || !text) return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  if (title.length > 200) return NextResponse.json({ error: 'title too long' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  const created = await prisma.suggestion.create({
    data: { authorId: user.id, title, body: text, category, status: SuggestionStatus.PROPOSED },
  });

  await audit({ userId: user.id, action: 'suggestion.create', entityType: 'Suggestion', entityId: created.id, payload: { title, category } });

  return NextResponse.json({ suggestion: created }, { status: 201 });
}
