import { auth } from '@/lib/auth';

export default auth((req) => {
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
