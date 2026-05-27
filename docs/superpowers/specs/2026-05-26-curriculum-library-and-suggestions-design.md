# Curriculum Library + Suggestions Page — Design Spec

**Date:** 2026-05-26
**Status:** Approved through brainstorming; ready for implementation planning.
**Author:** Blair Dupre (via Claude collaborative brainstorm)
**Implements:** Phase 3 of `docs/PHASES.md` — curriculum library vision, plus a new Phase 3 sub-feature (in-app suggestions → PR workflow) not previously specified.

## Why

Today the planner tracks lesson completion as free-text (`Lesson.curriculum`, `Lesson.lessonRef`) and has no curated topic-selection support for Science and History. The daily schedule allocates Mon/Wed to science and Tue/Thu to history as "Family Content" blocks, but week-by-week topic choice happens in the parent's head. The `CurriculumResource` Prisma model exists in schema, defined for exactly this purpose, but is empty and unused.

Two distinct problem shapes need solving:

1. **Sequential curricula (Singapore Math, Logic of English):** deterministic scope-and-sequence. The work is digitizing the publisher's chapter/lesson tree and surfacing "this child's next lesson" in the planner.
2. **Exploratory curricula (Science, History):** no fixed path. The work is curating a vetted topic library tagged by age + term + framework, then surfacing matches when planning a week.

A third addition was scoped during brainstorming: a **Suggestions** page so the family can capture in-app wishes that the dev workflow (Claude + `gh` CLI) can mine into GitHub issues and PRs.

## Decisions made during brainstorming

| Question | Decision |
|---|---|
| Drive mode for Science/History | Curated library + picker. No AI recommender. |
| Age model | Family topic, two activity tiers (one topic per slot; tier-7 + tier-4 activities both present). |
| Framework strategy | Research and recommend (done). |
| Initial seed scope | Full year (summer-2026 through summer-2027). |
| Build order | Incremental: ship Library + Suggestions first (PR 1); ship picker integration + per-child sequence surfacing second (PR 2). |
| Suggestions nav placement | Top-level tab. |
| Suggestions → GitHub | Manual sync via `gh` CLI script. No autonomous loop. |

## Framework choices (synthesized from research)

| Subject | Anchor | Cadence | Notes |
|---|---|---|---|
| Math | **Singapore Dimensions Math** (KA/KB for Middle, 2A/2B for Eldest) | Daily 1:1 | Add **Challenging Word Problems 2** for Eldest. Use the published [scopes & sequences](https://www.singaporemath.com/pages/scopes-sequences) PDF as the seed source. |
| English | **Logic of English Foundations** (A→B Middle, C→D Eldest) | 3 lessons/week per child | Use the official [Foundations A-D Scope & Sequence PDF](https://loe-assets.logicofenglish.com/downloads/foundations-a-b-c-d-ss.pdf). 40 + 8 lessons per book. |
| Science (Mon, indoor) | **Mystery Science** ($199/yr) | 1 video lesson/week | Subscription, video-led, household-item experiments. K-2 grade selector handles two-tier scaling. |
| Science (Wed, outdoor) | **Outdoor Hour Challenge + Handbook of Nature Study** | 1 outdoor block/week | PNW-perfect (tide pools, Forest Park, Tualatin Hills, salmon, banana slugs). Pair with [Chickie & Roo Oregon Nature Guide](https://www.chickieandroo.com/product/oregon-nature-guide/). |
| Science (taxonomy only) | **BFSU Vol 1** Table of Contents | — | Used as the conceptual map (4 threads: Matter / Life / Physical / Earth-Space). **NOT** taught from directly — prep load would burn out the parent. |
| History (Tue/Thu) | **Story of the World Vol 1 — 25th Anniversary Expanded Ed. (2026)** | 1 chapter/week ≈ 2 sessions | 42 chapters. Activity book bakes in two-tier activities. 4-year classical cycle lines up: Eldest does Vol 1 (Ancients) 2nd grade → Vol 4 in 5th grade → logic-stage repeat 6th-9th. |
| History supplement | **Build Your Library Level 0** picture books | Optional | Tier-4 activity ideas for Middle (continents, world animals). |

**Year-1 curriculum spend:** ~$330 (Mystery Science $199, SOTW bundle ~$60, Handbook of Nature Study ~$30, Oregon Nature Guide ~$30, BFSU Kindle $10).

## Schema changes

### Extend `CurriculumResource`

```prisma
model CurriculumResource {
  // ... existing fields preserved ...

  framework         String?    // "Mystery Science" | "OHC" | "SOTW Vol 1" | "BYL Level 0"
  weekHint          Int?       // suggested week-of-term (1-10 for summer)
  season            String?    // "summer" | "fall" | "spring" | "any"
  activities        Json?      // { tier7: { instructions, materials, time }, tier4: { ... } }
  bookList          String[]   // titles to request via library
  videoUrl          String?
  fieldTripLocation String?    // "Forest Park, Portland" | "Oregon Historical Society"
  sourceUrl         String?    // canonical publisher URL
  active            Boolean    @default(true)
  deletedAt         DateTime?

  @@index([subject, season])
  @@index([framework])
}
```

### New: `CurriculumSequence` + `SequenceEntry` + `SequenceAssignment`

Digitized scope-and-sequence for Singapore Math and LOE.

```prisma
model CurriculumSequence {
  id          String   @id              // "dim-math-2a", "loe-foundations-c"
  name        String                    // "Singapore Dimensions Math 2A"
  publisher   String
  subject     Subject
  ageRangeMin Int                       // 7
  ageRangeMax Int                       // 8
  sourceUrl   String?                   // publisher scope-and-sequence URL
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  entries     SequenceEntry[]
  assignments SequenceAssignment[]
}

model SequenceEntry {
  id               String   @id @default(cuid())
  sequenceId       String
  orderIndex       Int                  // 1, 2, 3 ...
  unit             String               // "Chapter 3" | "Lesson 82"
  lessonRef        String               // "3.4" | "Lesson 82"
  topic            String               // "Subtraction with Regrouping in Tens"
  estimatedMinutes Int?
  isReview         Boolean  @default(false)

  sequence         CurriculumSequence @relation(fields: [sequenceId], references: [id])

  @@unique([sequenceId, orderIndex])
  @@index([sequenceId, orderIndex])
}

model SequenceAssignment {
  id              String   @id @default(cuid())
  childId         String
  sequenceId      String
  currentEntryId  String?              // pointer; null = not started
  startedAt       DateTime @default(now())
  completedAt     DateTime?

  child           Child @relation(fields: [childId], references: [id])
  sequence        CurriculumSequence @relation(fields: [sequenceId], references: [id])

  @@unique([childId, sequenceId])
}
```

### New: `WeeklyTopic`

Records which Science / History resource is chosen for a given term-week-subject.

```prisma
model WeeklyTopic {
  id          String   @id @default(cuid())
  termId      String
  weekNumber  Int                       // 1-10 (summer), 1-17 (fall), etc.
  subject     Subject                   // SCIENCE | HISTORY only (enforced in app)
  resourceId  String
  notes       String?  @db.Text
  selectedBy  String                    // user email
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  term        Term @relation(fields: [termId], references: [id])
  resource    CurriculumResource @relation(fields: [resourceId], references: [id])

  @@unique([termId, weekNumber, subject])
  @@index([termId, weekNumber])
}
```

### New: `Suggestion`

```prisma
model Suggestion {
  id          String   @id @default(cuid())
  authorId    String
  title       String
  body        String   @db.Text
  category    String?                   // "library" | "ui" | "tracking" | "bug" | "other"
  status      SuggestionStatus @default(PROPOSED)
  upvotes     Int      @default(0)
  ghIssueUrl  String?
  ghPrUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  author      User @relation(fields: [authorId], references: [id])

  @@index([status, createdAt])
}

enum SuggestionStatus {
  PROPOSED
  TRIAGED
  IN_PROGRESS
  DONE
  WONT_DO
}
```

Schema additions also require: `Term` gets `weeklyTopics WeeklyTopic[]`; `CurriculumResource` gets `weeklyTopics WeeklyTopic[]`; `Child` gets `sequenceAssignments SequenceAssignment[]`; `User` gets `suggestions Suggestion[]`.

## UI changes

### PR 1 (ships first)

**New tab: `Library`** — a browse/filter surface over `CurriculumResource`.

- Filter chips: Subject, Age tier (4-5 / 7), Term, Framework, Season, Resource type.
- Search box (full-text title + description).
- Result cards show: title, framework badge, age-tier ribbon, materials count, link out to source.
- Detail drawer on click: full description, tier-7 activity, tier-4 activity, book list (with "copy to library hold list"), video embed (if any), field-trip note.
- No editing in PR 1 — read-only browsing. Resource CRUD comes in a later phase (Phase 3b admin UI).

**New tab: `Suggestions`** — `/suggestions` route.

- Form at top: title (required), body (required, markdown supported), category dropdown.
- List below: all suggestions, grouped by status (Proposed → Triaged → In Progress → Done / Won't Do).
- Per-row: upvote (one-click increment), GitHub issue link if synced, GitHub PR link if shipped.
- `POST /api/suggestions` creates; `PATCH /api/suggestions/:id` updates status/votes.

**New script: `scripts/sync-suggestions.ts`**

- Reads all `status=PROPOSED` rows.
- For each, calls `gh issue create --title "$title" --body "$body" --label "from-planner-app"` via shell.
- Stores returned issue URL back in `ghIssueUrl`, sets `status=TRIAGED`.
- Run manually via `npx tsx scripts/sync-suggestions.ts` from a machine with `gh` authed.
- No GitHub OAuth in the web app — keeps blast radius tiny.

### PR 2 (ships second)

**Week-grid integration** — the existing "Family Content" rows (`PlannerApp.tsx` `DAILY_BLOCKS` line ~50) currently show static text `"Science (Mon/Wed) · History (Tue/Thu)"`. PR 2 replaces this with per-day topic display:

- Mon/Wed rows: show current week's `WeeklyTopic` for SCIENCE; click → modal with 3-5 best-fit Library resources for current term theme + age range + season. Pick one → write `WeeklyTopic` row.
- Tue/Thu rows: same flow for HISTORY.
- Empty state: "Pick a topic" CTA.
- After pick: row shows topic title, materials count, "view detail" link.

**Per-child Next-Lesson surfacing** — the existing `Progress` tab in `PlannerApp.tsx`:

- For each child, look up `SequenceAssignment` rows.
- Show "Next Math: 2A.3.4 — Subtraction with Regrouping (~25 min)" + "Log Complete" button.
- Show "Next LOE: Lesson 82 — Phonogram /oa/" + same button.
- Click "Log Complete" → POSTs a Lesson row with the entry's metadata pre-filled + advances `currentEntryId` to the next entry.

### Routes

- `/library` — Library tab (already nestable under PlannerApp tabs)
- `/suggestions` — Suggestions tab
- `/api/library/search?subject=&age=&term=...` — filter
- `/api/suggestions` — POST create, GET list
- `/api/suggestions/[id]` — PATCH update
- `/api/weekly-topic` — POST/DELETE (PR 2)
- `/api/sequence-progress` — POST advance entry, GET next entries per child (PR 2)

## Seed data plan

The `prisma/seed.ts` file gains new sections. All data sourced from public publisher pages (URLs in code comments). Year-1 totals:

| Source | Records |
|---|---|
| Dimensions Math KA + KB entries (Middle's track) | ~134 SequenceEntries |
| Dimensions Math 2A + 2B entries (Eldest's track) | ~110 SequenceEntries |
| LOE Foundations A + B entries (Middle) | ~80 SequenceEntries |
| LOE Foundations C + D entries (Eldest) | ~80 SequenceEntries |
| Mystery Science K-2 topics (Mon, tagged by term theme) | ~30 CurriculumResources |
| Outdoor Hour Challenge / nature topics (Wed, PNW-themed, seasonal — sized to cover ~35 Wed weeks across the year) | ~35 CurriculumResources |
| Story of the World Vol 1 chapters with reading lists + activity tiers + Portland field-trip tags | 42 CurriculumResources |
| Build Your Library Level 0 picture-book entries (Middle tier-4) | ~30 CurriculumResources |
| **Total seed** | **~526 records** |

The seed script is idempotent (`upsert` on stable IDs like `dim-math-2a-3-4`). Re-running it adds new entries without disturbing user-created `Lesson` or `WeeklyTopic` rows.

**Copyright posture:** chapter titles, lesson numbers, and publisher names are factual references (not protectable). Tier-7 / tier-4 activity descriptions are paraphrased / written fresh from research notes. We never reproduce the actual SOTW prose, Mystery Science video content, or LOE lesson scripts. We link out to source URLs.

## Suggestions → PR workflow (operational)

1. Family member types a wish in `/suggestions`. Row inserted with `status=PROPOSED`.
2. On demand, run `npx tsx scripts/sync-suggestions.ts` from a developer machine with `gh` authed. No schedule, no auto-trigger.
3. Each proposed row becomes a GitHub issue; URL written back; status flips to `TRIAGED`.
4. When asked, Claude reads `/api/suggestions?status=TRIAGED`, picks a high-value one, opens a feature branch, implements + PR.
5. PR merges → status flips to `DONE`; `ghPrUrl` recorded.

No web-app-side GitHub OAuth, no Vercel cron job, no autonomous loop. Strict manual gate at the `gh` CLI step.

## What's explicitly NOT in scope

- AI / LLM recommender for Science / History topic selection
- Auto-PR generation from suggestions
- Vercel Cron / scheduled GitHub sync
- Library hold integration (Hillsboro / Multnomah County)
- Resource admin CRUD UI (read-only Library in PR 1; admin in later Phase 3b)
- Photo upload (Phase 2)
- iCal export (Phase 2)
- Multi-tenancy / public product (Phase 4)
- Editing the Math/LOE scope after seeding (always-add-new, soft-delete with `active=false`)

## Risks & open questions

1. **Mystery Science deep-linking** — we link to public lesson pages. If they paywall or remove a URL, the link breaks. **Mitigation:** store `sourceUrl` but display title + materials list inline; broken link doesn't break the planner.
2. **SOTW 25th-Anniversary chapter list** — the expanded edition added chapters (China, Korea, Silk Road, Herod, Masada). Need to seed against the new ToC, not the old one. **Mitigation:** document the edition explicitly in the seed file; flag for resync if Eldest is on the older edition.
3. **Sequence pacing drift** — kids don't progress on the planner's pace. The "next entry" pointer must be parent-overridable (skip, repeat, jump). **Mitigation:** PR 2 `/api/sequence-progress` accepts arbitrary entry id, not just "advance one."
4. **Two-tier activity authorship load** — writing tier-7 + tier-4 for 92 SOTW + Mystery Science + OHC entries is real work. **Mitigation:** Claude drafts; Blair reviews; ship even if some entries have only tier-7 (tier-4 fills in over time).
5. **Suggestions spam / accidental sync** — `sync-suggestions.ts` should be idempotent (skip rows already with `ghIssueUrl`) and require explicit run (no auto-trigger). **Mitigation:** script logs each issue created and supports `--dry-run`.

## Build order

### PR 1: "Library + Suggestions" (~2-3 hours focused)

- Prisma migration: extend `CurriculumResource`, add `CurriculumSequence`, `SequenceEntry`, `SequenceAssignment`, `WeeklyTopic`, `Suggestion` + enum.
- Seed script additions (~526 records).
- Library tab (read-only browse + filter + detail drawer).
- Suggestions tab (form + list + upvote + status grouping).
- `scripts/sync-suggestions.ts` with `--dry-run` flag.
- Updated `docs/PHASES.md` marking Phase 3a items.

### PR 2: "Picker + Next-Lesson" (~2-3 hours focused)

- Week-grid `DAILY_BLOCKS` "Family Content" rows become topic-aware.
- Weekly topic picker modal.
- Progress tab per-child "Next: ..." with one-click log-and-advance.
- `/api/weekly-topic` and `/api/sequence-progress` routes.
