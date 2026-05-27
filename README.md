# atozfamily-planner

The Whitford School operations center — a real, production-grade homeschool planner for two adults to operate together. Lives at `planner.atozfamily.org`.

> **Phase 1 ships now.** Phase 2 (photo upload, iCal export, full PWA) is wired in the schema but not yet built in the UI. Phase 3 (curriculum library with experiments, books, videos, materials) is schema-only.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind
- **Database**: PostgreSQL (Neon free tier)
- **ORM**: Prisma
- **Auth**: NextAuth v5 with email magic links (Resend) + 2-email allowlist
- **Hosting**: Vercel
- **Domain**: planner.atozfamily.org (CNAME → Vercel)

## What you get in Phase 1

- ✅ Two-adult shared workspace, real-time-ish sync (auto-save every ~800ms)
- ✅ Allowlist auth — only your 2 emails can sign in, everyone else rejected
- ✅ Weekly schedule grid, prep checklist, click-to-complete per child per block
- ✅ Year roadmap: Summer 2026, Fall 2026, Spring 2027, Summer 2027 preview
- ✅ Per-lesson tracking (Oregon portfolio + your feedback loop)
- ✅ Daily reflection log (what worked, what didn't, tomorrow adjustment)
- ✅ Per-child progress with curriculum path visualization
- ✅ Full audit log of every change either of you make
- ✅ Print-friendly weekly schedule (`/print/week`) for the fridge
- ✅ Free-form notes
- ✅ Mobile-responsive

## Phase 2 (next, wired but not built)

- 📸 Photo upload (Vercel Blob) — kid work samples, attached to lessons
- 📅 iCal export endpoint — pipe schedule into Google Calendar
- 📱 PWA service worker — install to home screen, offline-capable
- 🔄 Real-time sync (Pusher or Supabase Realtime channels)
- 📊 Test record tracking with score report PDFs

## Phase 3 (V2)

- 📚 Curriculum library: recommended experiments per current term theme, history book lists, video lessons, articles, materials lists with purchase links or "find in your house" notes

---

## Quickstart (local dev)

```bash
# 1. Clone / extract this repo
cd atozfamily-planner

# 2. Copy environment template and fill in real values
cp .env.example .env
# Edit .env — see SETUP.md for what each var means

# 3. Install dependencies
npm install

# 4. Initialize database (creates tables)
npx prisma db push

# 5. Seed with default children, terms, planner state
npx tsx prisma/seed.ts

# 6. Run dev server
npm run dev
# → http://localhost:3000
```

Sign in with one of the emails in your `ALLOWED_EMAILS` list. In dev mode (no Resend configured), the magic link URL is printed to the console.

## Deploying to production

See [`docs/DEPLOY.md`](./docs/DEPLOY.md) for full step-by-step. Short version:

```bash
# After completing the one-time setup (Neon, Vercel, Resend, env vars)
./deploy.sh
```

Then in Vercel: add `planner.atozfamily.org` as a custom domain, and in your DNS provider add a CNAME from `planner` → `cname.vercel-dns.com`.

## Project layout

```
atozfamily-planner/
├── prisma/
│   ├── schema.prisma       # data model — read this first
│   └── seed.ts             # initial children, terms, planner state
├── src/
│   ├── app/
│   │   ├── layout.tsx      # root layout
│   │   ├── page.tsx        # → redirects to /planner
│   │   ├── globals.css     # Tailwind + print CSS
│   │   ├── signin/         # magic link sign-in page
│   │   ├── planner/        # main app (server component loads data)
│   │   ├── print/week/     # fridge-ready print view
│   │   └── api/
│   │       ├── auth/       # NextAuth route handler
│   │       ├── state/      # planner UI state (GET/POST)
│   │       ├── lessons/    # per-lesson CRUD
│   │       ├── reflections/# daily reflection CRUD
│   │       └── audit/      # audit log read
│   ├── components/
│   │   └── PlannerApp.tsx  # the entire client UI (tabs, forms, etc.)
│   ├── lib/
│   │   ├── db.ts           # Prisma client singleton
│   │   ├── auth.ts         # NextAuth config + allowlist enforcement
│   │   ├── audit.ts        # audit log helper
│   │   └── types.ts        # shared types & color map
│   └── middleware.ts       # auth gate for all routes
├── docs/
│   ├── DEPLOY.md           # step-by-step deployment guide
│   ├── ARCHITECTURE.md     # design decisions & rationale
│   ├── OREGON.md           # legal homeschool requirements & how this app helps
│   └── PHASES.md           # what's built, what's next, what's later
├── public/
│   └── manifest.json       # PWA manifest (Phase 2 enables service worker)
├── deploy.sh               # one-shot deploy script
├── .env.example            # env template — copy to .env
└── package.json
```

## Operating notes

- **Auto-save**: All state changes debounce-save to the database every ~800ms. The header shows "Saved HH:MM:SS" when it lands.
- **Audit log**: Every state save, lesson, reflection, etc. writes an `AuditLog` row. View at the Audit tab.
- **Concurrency**: Last-write-wins. If both of you edit simultaneously, the second save overwrites. Phase 2 adds real-time sync to prevent this. For two people not actively at the same time, it's a non-issue.
- **Adding new emails**: Edit `ALLOWED_EMAILS` env var in Vercel dashboard, redeploy.
- **Resetting**: To wipe everything and start over: `npx prisma db push --force-reset && npx tsx prisma/seed.ts`.

## Cost estimate

All free tier for a 2-user family-scale app:

- **Neon Postgres**: free tier (500MB, sleeps when idle, fine for this use)
- **Vercel**: free tier (Hobby plan, fine for 2 users)
- **Resend**: free tier (100 emails/day, way more than needed)
- **Domain**: you already own it
- **Total**: $0/month

## License

Private — for the Whitford family. Not for redistribution.
