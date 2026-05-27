# Phases

What ships now, what's next, what's later. Be honest about scope.

## Phase 1 — SHIPPED (this repo)

The MVP that handles your real daily use case.

### Infrastructure
- ✅ Next.js 14 App Router + TypeScript + Tailwind
- ✅ Prisma + PostgreSQL (Neon)
- ✅ NextAuth v5 with email magic links (Resend)
- ✅ Email allowlist enforcement
- ✅ Deployable to Vercel + custom domain

### Features
- ✅ Two-user shared workspace
- ✅ Weekly schedule grid with click-to-complete
- ✅ Prep checklist
- ✅ Year roadmap (Summer 2026 → Summer 2027)
- ✅ Per-lesson tracking with subject, curriculum, lesson ref, difficulty, notes
- ✅ Daily reflection log (what worked / didn't / tomorrow)
- ✅ Per-child progress with curriculum path
- ✅ Audit log
- ✅ Free-form notes
- ✅ Print-friendly weekly schedule (`/print/week`)
- ✅ Mobile-responsive layout
- ✅ Auto-save every ~800ms

### Time to deploy: ~30–45 min following docs/DEPLOY.md

---

## Phase 2 — NEXT (1–2 weekends)

Schema is in place for all of these; UI/routes to build.

### Photo upload
- **Why**: kid work samples → portfolio gold. Each lesson can have attached photos.
- **What to build**:
  - Vercel Blob integration in `lib/storage.ts`
  - `/api/lessons/[id]/photo` route — POST = upload, DELETE = remove
  - Drag-drop photo zone in `LessonForm`
  - Photo grid in lesson detail view
- **Schema additions**: `Photo` model (file URL, lessonId FK, uploadedById, createdAt)
- **Cost**: Vercel Blob free tier = 1GB. ~3000 photos at 300KB each.

### iCal export
- **Why**: pipe your schedule into Google Calendar so it lives where you already check
- **What to build**:
  - `/api/ical/[secretToken].ics` route generating an iCal feed
  - Generate per-user secret token in `User.icalToken` field
  - Settings UI to copy/regenerate the URL
- **Schema additions**: `User.icalToken` (unique, nullable string)

### PWA service worker
- **Why**: install to home screen, work offline for read-only access
- **What to build**:
  - `next-pwa` or hand-rolled service worker in `public/sw.js`
  - Cache strategy: stale-while-revalidate for state, network-first for mutations
  - Icons (192x192, 512x512) in `public/`
  - "Install" prompt UI

### Real-time sync
- **Why**: if you and your wife edit simultaneously, last-write-wins is a problem
- **What to build**:
  - Pusher Channels (or Supabase Realtime) wired to state changes
  - Server publishes change events, client subscribes and reconciles
  - Conflict UI: "her edit overwrote yours, view diff?"
- **Cost**: Pusher free tier = 100 daily connections, plenty.

### Test record tracking
- **Why**: Eldest's first ITBS test is Summer 2027. By then, having a UI for it is helpful.
- **What to build**:
  - TestRecord form (date, type, proctor, scores)
  - Photo/PDF upload of score reports
  - Year-over-year score chart

### Estimated effort: 8–12 hours of focused work

---

## Phase 3 — LATER (V2 — curriculum library)

The vision: when you're planning the science block for the week and it's "Pacific Northwest Naturalists" theme, the planner shows you 5 hands-on experiments with materials lists (some "buy at Fred Meyer," some "find in your kitchen"), 8 picture books with library availability checks, 3 video lessons, and 2 nearby field trip options — all curated to the current term's theme.

### Schema is already in place

The `CurriculumResource` model exists with: type, title, description, url, ageRange, subject, tags, termIds, materials, notes.

### What to build

- **Admin UI** to add/edit resources (you'd curate over time)
- **Resource browser** filtered by current term's themes
- **Materials list aggregator** — "to do all the recommended experiments this term, you need these 23 items"
- **Library hold integration** — if the resource is a book, check Hillsboro/Multnomah library system for availability
- **Watch/read history** — mark what you've used with each child
- **Community contributions** (if you ever go multi-tenant) — other families share their curated resources

### Why this is V2 not V1

This is the kind of feature that's only valuable AFTER you've used the planner for a while and have a clear sense of what gaps exist. Building it pre-emptively risks designing for use cases that don't actually exist.

### Estimated effort: 20–30 hours plus ongoing curation

---

## Phase 4 — IF (multi-tenant, public product)

Only if other homeschool families start asking "where can I get this?" — at which point:

- Multi-tenant schema (`Family` model, `familyId` on everything)
- Invite-based onboarding
- Stripe billing
- Public landing page at `atozfamily.org`
- Marketing site, customer support, etc.

This is a real product, not a family tool. Don't start unless you genuinely want to be a SaaS operator. Talked about this risk in our earlier conversation — Path 4 is a different life than Path 1–3.

---

## What I'd actually do next

If I were you, in this order:

1. **Deploy Phase 1** (today, 30 min)
2. **Use it for 2 weeks** before adding anything. Watch what's missing in real use.
3. **Pick ONE Phase 2 feature** based on what you actually missed — probably photo upload OR iCal, not both
4. **Build that one feature**. Use planner another 2 weeks.
5. **Repeat**.

Resist the urge to batch-build Phase 2. The Whitford Reset taught you this — features added without real usage data become noise.
