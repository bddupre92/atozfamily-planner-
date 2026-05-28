import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// POST /api/ical/setup
// - With body { rotate: true }: rotate to a new token (invalidates the old URL)
// - Otherwise: ensure the user has a token (generate if missing) and return it.
// Returns { token, url } so the UI can show a copyable feed URL.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const rotate = body?.rotate === true;

  let token = user.icalToken;
  if (!token || rotate) {
    token = randomBytes(24).toString('base64url');
    await prisma.user.update({ where: { id: user.id }, data: { icalToken: token } });
    await audit({
      userId: user.id,
      action: rotate ? 'ical.rotate' : 'ical.generate',
      entityType: 'User',
      entityId: user.id,
    });
  }

  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  const proto = req.headers.get('x-forwarded-proto')
    ?? (host.startsWith('localhost') ? 'http' : 'https');
  const base = host ? `${proto}://${host}` : '';

  return NextResponse.json({
    token,
    url: `${base}/api/ical/${token}/feed.ics`,
  });
}
