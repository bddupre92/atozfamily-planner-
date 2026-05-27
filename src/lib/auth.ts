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

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
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
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
