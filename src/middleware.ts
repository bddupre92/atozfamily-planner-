import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// AUTH_BYPASS=true short-circuits the entire middleware. No session lookup,
// no /signin redirect — every request passes through. Pair with Vercel
// Password Protection so the site isn't publicly readable.
// Tolerate quoting/casing variants ("true", `true`, "True") since values
// pasted from .env files sometimes carry literal quotes through dashboards.
const RAW_BYPASS = (process.env.AUTH_BYPASS ?? '').trim().replace(/^"|"$/g, '').toLowerCase();
const BYPASS = RAW_BYPASS === 'true' || RAW_BYPASS === '1';

// Pre-build the NextAuth-wrapped middleware once at module init so we don't
// re-wrap on every request when bypass is off.
const authMiddleware = auth((req) => {
  const isAuthed = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith('/signin') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico';

  if (!isAuthed && !isPublic) {
    const signinUrl = new URL('/signin', req.nextUrl.origin);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(signinUrl);
  }
});

export default async function middleware(req: NextRequest) {
  if (BYPASS) {
    // Auth disabled at the application layer. All routes are reachable.
    const res = NextResponse.next();
    res.headers.set('x-auth-bypass', 'on');
    return res;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await (authMiddleware as any)(req);
  // Only annotate when we have a mutable Response (redirects from `auth()`
  // are bare Response objects whose headers may not be writable; ignore failures).
  try {
    res?.headers?.set?.('x-auth-bypass', `off:raw=${RAW_BYPASS.length}`);
  } catch {}
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
