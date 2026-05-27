# Architecture

Why this is built the way it is. Read when you're about to refactor and want to know what tradeoffs were made.

## Stack rationale

**Next.js 14 App Router + Prisma + PostgreSQL** — chosen because:
1. Matches your InvestigationIQ stack. Zero learning curve.
2. Server components mean we load all initial planner data at the page level (`/planner/page.tsx`) and stream it to the client component in one go. No client-side data-fetching waterfalls.
3. API routes are co-located. The whole app is one repo, one deploy.

**NextAuth v5 (Auth.js)** — chosen for:
- Email magic link out of the box (no passwords to manage)
- Allowlist enforced in the `signIn` callback — security-through-explicit-allow, not security-through-obscurity
- Database sessions (not JWT) so we can revoke sessions if needed

**Neon Postgres** — chosen for:
- True Postgres, not a SQLite-in-disguise
- Free tier generous enough for family-scale forever
- Branching for safe schema migrations later
- Sleeps when idle (zero cost when not in use)

**Vercel** — chosen because:
- Auto-deploys from GitHub
- Free SSL on custom domains
- Edge functions for fast cold starts
- You already know the operational model

## Data model decisions

### Why `PlannerState` is a single JSONB blob

The weekly schedule template, prep checklist completion state, and daily block check marks are all ephemeral UI state, not analytical data. Putting them in normalized tables would be over-engineering. JSONB lets us evolve the UI without schema migrations.

What IS in normalized tables: `Lesson`, `Reflection`, `TermProgress`, `TestRecord`. These are the data you actually want to query, aggregate, and report on.

### Why `Lesson` is a first-class entity

Per-lesson tracking is one of your must-have features, AND it's how the planner serves double-duty as your Oregon portfolio. Every logged lesson becomes a defensible "we instructed on X subject, this curriculum, this date." If you ever face a 15th-percentile audit, you have receipts.

The `status` enum includes `ABANDONED` deliberately — a bad day where you started but couldn't finish is still instruction time per Oregon's loose standards, and tracking it captures real signal about how things are going (vs. quietly disappearing into a memory hole).

### Why `Reflection` is separate from `Lesson`

A reflection is meta — your observation about the day or a child. A lesson is the act of instruction itself. Different cardinality, different query patterns, different forms. Conflating them would force you to log a "fake lesson" to capture a reflection on a no-school day.

### Why `AuditLog` exists

Two reasons:
1. **Trust between adults**: when your wife sees a state change and isn't sure who did it or why, she can check.
2. **Debug**: if state gets weird, you can reconstruct the sequence of events.

Audit writes are fire-and-forget — they never block the main response and never fail the request if logging fails. The `audit()` helper in `lib/audit.ts` enforces this.

### Why allowlist instead of full RBAC

You have 2 users. Both have full access. Building roles & permissions for 2 people is over-engineering. The allowlist is the simplest thing that works: if you're on the list, you're in; if you're not, you're out. Phase 3 would add roles if you ever publish this for other families.

## Auth flow

1. User hits any page → middleware checks for session
2. No session → redirect to `/signin?callbackUrl=...`
3. User enters email → `signIn('resend', { email })`
4. NextAuth generates a one-time token, stores in `VerificationToken` table
5. Resend sends the email with magic link containing the token
6. User clicks link → token validated → session created → callback URL
7. **CRITICAL**: `signIn` callback checks email against `ALLOWED_EMAILS`. Reject = no session created, even if token is valid.

This means even if someone intercepts a magic link, they can't use it unless they're on the allowlist.

## API route conventions

All routes:
1. Call `await auth()` first, return 401 if not authenticated
2. Validate inputs minimally (we're not exposed to the public internet beyond the allowlist)
3. Write to DB
4. Call `audit(...)` for meaningful changes
5. Return JSON

We deliberately don't have a heavy validation layer (Zod, etc.) because:
- The clients are our own and we trust them
- Allowlist enforcement is upstream of all routes
- Prisma type-checks at the boundary

## State management on the client

The `PlannerApp` component holds all state in React `useState`. On every change to the planner UI state, a debounced (~800ms) fetch saves to `/api/state`. The header shows "Saved HH:MM:SS" when the save lands.

For lessons and reflections, the create form returns the created entity, which is prepended to the in-memory list. No re-fetch needed.

This is "good enough" sync for two adults who are rarely editing at the exact same instant. Phase 2 would add real-time sync via Pusher or Supabase channels.

## What's NOT here

Things I deliberately did not build in Phase 1:

- **Real-time multi-user sync** — overkill for 2 people who edit at different times. Phase 2.
- **Photo upload** — schema has `Photo` model wired but no upload UI yet. Phase 2.
- **iCal export** — would need a `/api/ical/[token].ics` route generating a feed. Phase 2.
- **Service worker / PWA offline** — `manifest.json` is in place but no SW registered. Phase 2.
- **Curriculum library content** — `CurriculumResource` model exists but no admin UI to add resources. Phase 3.
- **Email digest** — "your week in review" Sunday digest. Future.
- **Mobile app** — the responsive web app + PWA install covers this.

## Migration path if you want to publish this for other families

Currently this is hardcoded for one family. To make it multi-tenant:

1. Add `Family` model with `id`, `name`, `subdomain`
2. Add `userId` → `familyId` relation (many users per family)
3. Add `familyId` to every other model
4. Update every query to filter by `familyId` derived from session
5. Replace allowlist with invite-based onboarding
6. Add billing (Stripe)

Roughly 2 weeks of focused work. Don't do it unless you genuinely want to be a SaaS operator. For your own family, the current shape is correct.
