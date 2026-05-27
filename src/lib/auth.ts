import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Resend } from 'resend';
import { prisma } from './db';

// ─────────────────────────────────────────────────────────────────────────
// ALLOWLIST — only emails in ALLOWED_EMAILS env var can sign in.
// Everyone else is rejected at the sign-in callback layer.
// ─────────────────────────────────────────────────────────────────────────
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// ─────────────────────────────────────────────────────────────────────────
// AUTH BYPASS — temporary kill-switch.
// When AUTH_BYPASS=true, the in-app NextAuth login is skipped and every
// request is treated as authenticated as a single shared "Family" user.
// Pair this with Vercel Password Protection at the gateway so the site
// itself is not publicly readable.
// To re-enable real auth: remove AUTH_BYPASS env var, redeploy.
// ─────────────────────────────────────────────────────────────────────────
// Tolerate quoting/casing variants ("true", `true`, "True") since values
// pasted from .env files sometimes carry literal quotes through dashboards.
const _RAW_AUTH_BYPASS = (process.env.AUTH_BYPASS ?? '').trim().replace(/^"|"$/g, '').toLowerCase();
const AUTH_BYPASS = _RAW_AUTH_BYPASS === 'true' || _RAW_AUTH_BYPASS === '1';
const DEFAULT_USER_EMAIL = 'family@atozfamily.org';
const DEFAULT_USER_NAME = 'Family';
let cachedDefaultUserId: string | null = null;

async function getOrCreateDefaultUser() {
  if (cachedDefaultUserId) return cachedDefaultUserId;
  // 1) Fast path: user already exists (most common after the first call).
  let u = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (!u) {
    // 2) Create it; tolerate concurrent prerender races where another worker
    //    beats us to the INSERT (P2002 = unique constraint on email).
    try {
      u = await prisma.user.create({
        data: { email: DEFAULT_USER_EMAIL, name: DEFAULT_USER_NAME, emailVerified: new Date() },
      });
    } catch (e: unknown) {
      u = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
      if (!u) throw e;
    }
  }
  cachedDefaultUserId = u.id;
  return u.id;
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const nextAuthExports = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT strategy required: middleware runs on Edge runtime and cannot execute
  // Prisma queries to validate database-backed sessions. JWTs verify in the
  // cookie without a DB round-trip. The PrismaAdapter still persists User and
  // VerificationToken rows (used by Resend magic-link callback in API routes).
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/signin',
    error: '/signin',
    verifyRequest: '/signin?verify=1',
  },
  providers: [
    {
      id: 'resend',
      name: 'Email',
      type: 'email',
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier: email, url }) {
        if (!resend) {
          // Dev fallback: log the magic link to console
          console.log('\n────────────────────────────────');
          console.log('🔑 MAGIC LINK (dev mode — no Resend configured)');
          console.log(`   Email: ${email}`);
          console.log(`   URL:   ${url}`);
          console.log('────────────────────────────────\n');
          return;
        }
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? 'planner@atozfamily.org',
          to: email,
          subject: 'Sign in to atozfamily planner',
          html: `
            <div style="font-family: Georgia, serif; max-width: 480px; margin: 32px auto; padding: 32px; background: #FAF6EF; border-radius: 12px; color: #2D2418;">
              <h1 style="font-size: 24px; margin: 0 0 16px;">Welcome back</h1>
              <p style="font-size: 15px; line-height: 1.5; color: #5C4D38;">Click below to sign in to the family planner. Link expires in 24 hours.</p>
              <p style="margin: 28px 0;">
                <a href="${url}" style="background: #B86A3F; color: #FAF6EF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Sign in</a>
              </p>
              <p style="font-size: 12px; color: #8A7A60;">If you didn't request this, ignore the email.</p>
            </div>
          `,
        });
        if (error) {
          console.error('Resend email error:', error);
          throw new Error('Failed to send verification email');
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      if (!ALLOWED_EMAILS.includes(email)) {
        console.warn(`🚫 Sign-in attempt rejected for: ${email}`);
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in `user` is populated from the adapter; persist its id
      // into the token so subsequent middleware/server calls can read it.
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuthExports;

// Wrap auth() so AUTH_BYPASS short-circuits the no-args session lookup with
// a synthetic Family session. Wrapper-mode calls (middleware/api handler) are
// also short-circuited so the middleware doesn't redirect to /signin.
const realAuth = nextAuthExports.auth;

function bypassSession() {
  return getOrCreateDefaultUser().then((id) => ({
    user: { id, email: DEFAULT_USER_EMAIL, name: DEFAULT_USER_NAME },
    expires: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: typeof realAuth = (((...args: any[]) => {
  if (AUTH_BYPASS) {
    // No-args call: return synthetic session
    if (args.length === 0) return bypassSession();
    // Middleware/route-wrapper: short-circuit to a pass-through handler
    const handler = args[0];
    if (typeof handler === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return async (req: any, ctx: any) => {
        req.auth = await bypassSession();
        return handler(req, ctx);
      };
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (realAuth as any)(...args);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any);
