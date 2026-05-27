import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// AUTH_BYPASS=true short-circuits the entire middleware. No session lookup,
// no /signin redirect — every request passes through. Pair with Vercel
// Password Protection so the site isn't publicly readable.
const BYPASS = process.env.AUTH_BYPASS === 'true';

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
    return NextResponse.next();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (authMiddleware as any)(req);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
