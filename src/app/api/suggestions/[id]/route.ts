import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { SuggestionStatus } from '@prisma/client';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = new Set(Object.values(SuggestionStatus));

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: any = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.has(body.status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    data.status = body.status;
  }
  if (body.upvote === true) {
    data.upvotes = { increment: 1 };
  }
  if (body.ghIssueUrl !== undefined) data.ghIssueUrl = body.ghIssueUrl;
  if (body.ghPrUrl !== undefined) data.ghPrUrl = body.ghPrUrl;

  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'no fields to update' }, { status: 400 });

  const updated = await prisma.suggestion.update({ where: { id: params.id }, data });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  await audit({ userId: user?.id, action: 'suggestion.update', entityType: 'Suggestion', entityId: params.id, payload: data });

  return NextResponse.json({ suggestion: updated });
}
