'use client';

import { signIn } from 'next-auth/react';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream px-6">
          <div className="w-full max-w-md bg-paper border border-rule rounded-xl p-8 shadow-sm">
            <div className="font-display text-2xl font-semibold mb-2">atozfamily planner</div>
            <div className="font-body text-sm text-ink-muted">Loading…</div>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const params = useSearchParams();
  const isVerify = params.get('verify') === '1';
  const callbackUrl = params.get('callbackUrl') ?? '/planner';
  const error = params.get('error');

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    await signIn('resend', { email, callbackUrl, redirect: false });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md bg-paper border border-rule rounded-xl p-8 shadow-sm">
        <div className="font-display text-2xl font-semibold mb-2">atozfamily planner</div>
        <div className="font-body text-sm text-ink-muted mb-6">
          Sign in with your allowlisted email. We&apos;ll send you a magic link.
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            Sign-in failed. Check that you used an allowlisted email.
          </div>
        )}

        {isVerify || submitted ? (
          <div className="p-4 bg-moss-soft border border-forest/30 rounded text-sm">
            ✉️ Check your email for a sign-in link. It expires in 24 hours.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-rule rounded bg-cream font-body text-sm"
            />
            <button
              type="submit"
              className="w-full bg-accent text-cream py-2.5 rounded font-body font-semibold text-sm hover:opacity-90 transition"
            >
              Send me a sign-in link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
