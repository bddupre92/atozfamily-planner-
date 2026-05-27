# Curriculum Library + Suggestions — PR 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a curated curriculum library (browseable + filterable) plus a Suggestions page with a manual `gh`-CLI sync, atop the existing atozfamily-planner Next.js app.

**Architecture:** Extend the existing Prisma `CurriculumResource` model and add 5 new models (`CurriculumSequence`, `SequenceEntry`, `SequenceAssignment`, `WeeklyTopic`, `Suggestion`). Seed ~526 records across 6 sub-seed files (one per source). Add two new tabs (`Library`, `Suggestions`) to the existing `PlannerApp.tsx`, with read-only browsing in PR 1; the week-grid picker integration comes in PR 2.

**Tech Stack:** Next.js 14 App Router, Prisma 5 + PostgreSQL (Neon), TypeScript, Tailwind, lucide-react, NextAuth v5. No test framework is installed; verification is manual via `curl`, `prisma studio`, and browser checks.

**Spec:** [`docs/superpowers/specs/2026-05-26-curriculum-library-and-suggestions-design.md`](../specs/2026-05-26-curriculum-library-and-suggestions-design.md)

---

## File map

| Path | Action | Responsibility |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add 5 models + 1 enum, extend `CurriculumResource` |
| `prisma/seed.ts` | Modify | Call new sub-seeders |
| `prisma/seeds/dimensions-math.ts` | Create | KA/KB/2A/2B sequence entries (~244) |
| `prisma/seeds/loe-foundations.ts` | Create | A/B/C/D sequence entries (~160) |
| `prisma/seeds/mystery-science.ts` | Create | ~30 K-2 resource rows |
| `prisma/seeds/outdoor-hour-challenge.ts` | Create | ~35 PNW nature-study rows |
| `prisma/seeds/story-of-the-world-v1.ts` | Create | 42 chapter rows with tier-7/tier-4 activities |
| `prisma/seeds/build-your-library-l0.ts` | Create | ~30 picture-book supplements |
| `src/lib/types.ts` | Modify | Add shared type exports |
| `src/app/api/library/route.ts` | Create | GET list with filters |
| `src/app/api/library/[id]/route.ts` | Create | GET single resource |
| `src/app/api/suggestions/route.ts` | Create | GET list, POST create |
| `src/app/api/suggestions/[id]/route.ts` | Create | PATCH update (status, upvote) |
| `src/components/library/LibraryTab.tsx` | Create | Browse + filter UI |
| `src/components/library/ResourceCard.tsx` | Create | One row in the grid |
| `src/components/library/ResourceDetailDrawer.tsx` | Create | Side-panel detail view |
| `src/components/suggestions/SuggestionsTab.tsx` | Create | Form + grouped list |
| `src/components/suggestions/SuggestionForm.tsx` | Create | Title/body/category input |
| `src/components/suggestions/SuggestionRow.tsx` | Create | One suggestion display + upvote |
| `src/components/PlannerApp.tsx` | Modify | Wire in two new tabs |
| `src/app/planner/page.tsx` | Modify | Load library + suggestions in initial fetch |
| `scripts/sync-suggestions.ts` | Create | `gh`-CLI bridge to GitHub issues |
| `docs/PHASES.md` | Modify | Mark Phase 3a items shipped |

---

## Pre-flight: Dev environment

- [ ] **Step 0.1: Create a Neon dev branch**

Open [console.neon.tech](https://console.neon.tech) → your project → Branches → "Create branch" → name `dev` → copy both the pooled and direct connection strings.

- [ ] **Step 0.2: Add local `.env.development.local`**

Create `~/Downloads/atozfamily-planner/.env.development.local` (gitignored by Next.js convention):

```
DATABASE_URL="postgresql://...dev-branch-pooled..."
DIRECT_DATABASE_URL="postgresql://...dev-branch-direct..."
AUTH_BYPASS="true"
AUTH_SECRET="dev-secret-not-used-with-bypass"
AUTH_URL="http://localhost:3000"
ALLOWED_EMAILS="blair.dupre@und.edu"
```

This file overrides `.env` for `next dev`. Production `.env` still points at the main Neon branch.

- [ ] **Step 0.3: Verify dev branch connectivity**

Run: `cd ~/Downloads/atozfamily-planner && npx prisma db pull --schema=prisma/schema.prisma`
Expected: schema introspection succeeds against the dev branch with no errors.

---

## Task 1: Schema additions

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1.1: Extend `CurriculumResource` model**

In `prisma/schema.prisma`, replace the existing `CurriculumResource` block (currently lines ~287-301) with:

```prisma
model CurriculumResource {
  id                String       @id @default(cuid())
  type              ResourceType
  title             String
  description       String?      @db.Text
  url               String?
  ageRange          String?
  subject           Subject
  tags              String[]
  termIds           String[]
  materials         String[]
  notes             String?      @db.Text
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  // PR1 additions
  framework         String?      // "Mystery Science" | "OHC" | "SOTW Vol 1" | "BYL Level 0"
  weekHint          Int?         // suggested week-of-term (1-10 for summer, etc.)
  season            String?      // "summer" | "fall" | "spring" | "any"
  activities        Json?        // { tier7: {...}, tier4: {...} }
  bookList          String[]     @default([])
  videoUrl          String?
  fieldTripLocation String?
  sourceUrl         String?
  active            Boolean      @default(true)
  deletedAt         DateTime?

  weeklyTopics      WeeklyTopic[]

  @@index([subject, season])
  @@index([framework])
}
```

- [ ] **Step 1.2: Add three sequence models below `CurriculumResource`**

Append to `prisma/schema.prisma`:

```prisma
model CurriculumSequence {
  id          String   @id
  name        String
  publisher   String
  subject     Subject
  ageRangeMin Int
  ageRangeMax Int
  sourceUrl   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  entries     SequenceEntry[]
  assignments SequenceAssignment[]
}

model SequenceEntry {
  id               String   @id @default(cuid())
  sequenceId       String
  orderIndex       Int
  unit             String
  lessonRef        String
  topic            String
  estimatedMinutes Int?
  isReview         Boolean  @default(false)

  sequence         CurriculumSequence @relation(fields: [sequenceId], references: [id], onDelete: Cascade)

  @@unique([sequenceId, orderIndex])
  @@index([sequenceId, orderIndex])
}

model SequenceAssignment {
  id              String    @id @default(cuid())
  childId         String
  sequenceId      String
  currentEntryId  String?
  startedAt       DateTime  @default(now())
  completedAt     DateTime?

  child           Child @relation(fields: [childId], references: [id])
  sequence        CurriculumSequence @relation(fields: [sequenceId], references: [id])

  @@unique([childId, sequenceId])
}
```

- [ ] **Step 1.3: Add `WeeklyTopic` and `Suggestion` models + enum**

Append to `prisma/schema.prisma`:

```prisma
model WeeklyTopic {
  id          String   @id @default(cuid())
  termId      String
  weekNumber  Int
  subject     Subject
  resourceId  String
  notes       String?  @db.Text
  selectedBy  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  term        Term @relation(fields: [termId], references: [id])
  resource    CurriculumResource @relation(fields: [resourceId], references: [id])

  @@unique([termId, weekNumber, subject])
  @@index([termId, weekNumber])
}

model Suggestion {
  id          String   @id @default(cuid())
  authorId    String
  title       String
  body        String   @db.Text
  category    String?
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

- [ ] **Step 1.4: Add back-relations to `Child`, `Term`, and `User`**

In `prisma/schema.prisma`, find these models and add the noted fields.

In `model Child` add:
```prisma
sequenceAssignments SequenceAssignment[]
```

In `model Term` add:
```prisma
weeklyTopics WeeklyTopic[]
```

In `model User` add:
```prisma
suggestions Suggestion[]
```

- [ ] **Step 1.5: Create + apply migration**

Run: `cd ~/Downloads/atozfamily-planner && npx prisma migrate dev --name curriculum_library_pr1`

Expected: prisma generates a new migration file under `prisma/migrations/<timestamp>_curriculum_library_pr1/migration.sql` and applies it to the dev branch. `Prisma Client` regenerates without errors.

- [ ] **Step 1.6: Verify schema via Prisma Studio**

Run: `cd ~/Downloads/atozfamily-planner && npx prisma studio` (opens at http://localhost:5555)
Expected: 6 new tables visible (`CurriculumResource` already existed; `CurriculumSequence`, `SequenceEntry`, `SequenceAssignment`, `WeeklyTopic`, `Suggestion`). Close studio when verified.

- [ ] **Step 1.7: Commit**

```bash
cd ~/Downloads/atozfamily-planner
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(schema): add curriculum library + sequences + suggestions models

PR 1 of curriculum library work. Extends CurriculumResource with framework,
weekHint, season, activities (tier-7/tier-4 JSON), bookList, videoUrl,
fieldTripLocation, sourceUrl, active, deletedAt. Adds CurriculumSequence
(+ SequenceEntry + SequenceAssignment) for digitizing Singapore Math and
LOE Foundations scope-and-sequence. Adds WeeklyTopic (term-week-subject
→ chosen resource) and Suggestion (+ SuggestionStatus enum).

Spec: docs/superpowers/specs/2026-05-26-curriculum-library-and-suggestions-design.md"
```

---

## Task 2: Seed scaffolding

**Files:**
- Modify: `prisma/seed.ts`
- Create: `prisma/seeds/dimensions-math.ts`, `prisma/seeds/loe-foundations.ts`, `prisma/seeds/mystery-science.ts`, `prisma/seeds/outdoor-hour-challenge.ts`, `prisma/seeds/story-of-the-world-v1.ts`, `prisma/seeds/build-your-library-l0.ts`

- [ ] **Step 2.1: Create empty sub-seed files**

Create each of these six files with this stub:

```ts
// prisma/seeds/dimensions-math.ts (and analogously for the other five files)
import { PrismaClient } from '@prisma/client';

export async function seedDimensionsMath(prisma: PrismaClient) {
  console.log('  • Dimensions Math: TODO');
}
```

Replace `seedDimensionsMath` and the log label per file:
- `seedLogicOfEnglish` / "Logic of English Foundations"
- `seedMysteryScience` / "Mystery Science K-2"
- `seedOutdoorHourChallenge` / "Outdoor Hour Challenge (PNW)"
- `seedStoryOfTheWorldV1` / "Story of the World Vol 1"
- `seedBuildYourLibraryL0` / "Build Your Library Level 0"

- [ ] **Step 2.2: Wire sub-seeders into `prisma/seed.ts`**

In `prisma/seed.ts`, near the bottom (before `await prisma.$disconnect()`), add:

```ts
import { seedDimensionsMath } from './seeds/dimensions-math';
import { seedLogicOfEnglish } from './seeds/loe-foundations';
import { seedMysteryScience } from './seeds/mystery-science';
import { seedOutdoorHourChallenge } from './seeds/outdoor-hour-challenge';
import { seedStoryOfTheWorldV1 } from './seeds/story-of-the-world-v1';
import { seedBuildYourLibraryL0 } from './seeds/build-your-library-l0';

// ... existing seeding ...

console.log('\n📚 Curriculum library seeding...');
await seedDimensionsMath(prisma);
await seedLogicOfEnglish(prisma);
await seedMysteryScience(prisma);
await seedOutdoorHourChallenge(prisma);
await seedStoryOfTheWorldV1(prisma);
await seedBuildYourLibraryL0(prisma);
```

(Move the `import` lines to the top of the file with the other imports.)

- [ ] **Step 2.3: Run seed to verify stubs execute cleanly**

Run: `cd ~/Downloads/atozfamily-planner && npm run db:seed`
Expected: existing seed output, followed by six "TODO" lines from the new sub-seeders, and no errors.

- [ ] **Step 2.4: Commit**

```bash
git add prisma/seed.ts prisma/seeds/
git commit -m "chore(seed): scaffold sub-seeders for curriculum library

Adds six empty seed files (one per content source), wired into
prisma/seed.ts. Tasks 3-8 fill them in."
```

---

## Task 3: Seed Singapore Dimensions Math sequences (KA, KB, 2A, 2B)

**Files:**
- Modify: `prisma/seeds/dimensions-math.ts`

Source: [Singapore Math Inc. Scopes & Sequences](https://www.singaporemath.com/pages/scopes-sequences) — open each level's PDF (KA, KB, 2A, 2B). Each PDF lists chapters with numbered lessons.

- [ ] **Step 3.1: Define sequence-creation helper**

Replace the file contents:

```ts
import { PrismaClient, Subject } from '@prisma/client';

type EntryInput = {
  unit: string;        // "Chapter 3"
  lessonRef: string;   // "3.4"
  topic: string;       // "Subtraction with Regrouping in Tens"
  estimatedMinutes?: number;
  isReview?: boolean;
};

type SequenceInput = {
  id: string;                // "dim-math-2a"
  name: string;              // "Singapore Dimensions Math 2A"
  publisher: string;         // "Singapore Math Inc."
  ageRangeMin: number;
  ageRangeMax: number;
  sourceUrl: string;
  entries: EntryInput[];
};

async function upsertSequence(prisma: PrismaClient, seq: SequenceInput) {
  await prisma.curriculumSequence.upsert({
    where: { id: seq.id },
    update: {
      name: seq.name,
      publisher: seq.publisher,
      ageRangeMin: seq.ageRangeMin,
      ageRangeMax: seq.ageRangeMax,
      sourceUrl: seq.sourceUrl,
      subject: Subject.MATH,
    },
    create: {
      id: seq.id,
      name: seq.name,
      publisher: seq.publisher,
      subject: Subject.MATH,
      ageRangeMin: seq.ageRangeMin,
      ageRangeMax: seq.ageRangeMax,
      sourceUrl: seq.sourceUrl,
    },
  });

  for (let i = 0; i < seq.entries.length; i++) {
    const e = seq.entries[i];
    await prisma.sequenceEntry.upsert({
      where: { sequenceId_orderIndex: { sequenceId: seq.id, orderIndex: i + 1 } },
      update: {
        unit: e.unit,
        lessonRef: e.lessonRef,
        topic: e.topic,
        estimatedMinutes: e.estimatedMinutes ?? null,
        isReview: e.isReview ?? false,
      },
      create: {
        sequenceId: seq.id,
        orderIndex: i + 1,
        unit: e.unit,
        lessonRef: e.lessonRef,
        topic: e.topic,
        estimatedMinutes: e.estimatedMinutes ?? null,
        isReview: e.isReview ?? false,
      },
    });
  }
  console.log(`  • ${seq.id}: ${seq.entries.length} entries`);
}

export async function seedDimensionsMath(prisma: PrismaClient) {
  await upsertSequence(prisma, DIM_MATH_KA);
  await upsertSequence(prisma, DIM_MATH_KB);
  await upsertSequence(prisma, DIM_MATH_2A);
  await upsertSequence(prisma, DIM_MATH_2B);
}
```

- [ ] **Step 3.2: Populate `DIM_MATH_KA`**

Below the function in the same file, add:

```ts
const DIM_MATH_KA: SequenceInput = {
  id: 'dim-math-ka',
  name: 'Singapore Dimensions Math KA',
  publisher: 'Singapore Math Inc.',
  ageRangeMin: 4,
  ageRangeMax: 5,
  sourceUrl: 'https://www.singaporemath.com/products/dimensions-math-textbook-ka',
  entries: [
    // Chapter 1: Match, Sort, and Classify (7 lessons)
    { unit: 'Chapter 1', lessonRef: '1.1', topic: 'Matching objects', estimatedMinutes: 20 },
    { unit: 'Chapter 1', lessonRef: '1.2', topic: 'Sorting by one attribute', estimatedMinutes: 20 },
    // ...continue from the official KA Scope & Sequence PDF (~59 lessons across 6 chapters)
  ],
};
```

**Action for the implementing agent:** Fetch the [KA Scope & Sequence PDF](https://www.singaporemath.com/products/dimensions-math-textbook-ka) (linked from the product page) and fill in all ~59 entries following the pattern above. Chapter list per the research notes: (1) Match/Sort/Classify, 7 lessons; (2) Numbers to 5, 12; (3) Numbers to 10, 13; (4) Shapes and Solids, 12; (5) Compare Height/Length/Weight/Capacity, 10; (6) Comparing Numbers Within 10, 5. If a Scope & Sequence PDF is paywalled or unavailable, dispatch a `general-purpose` subagent to extract the lesson list from publicly visible Cathy Duffy / homeschool blog reviews.

- [ ] **Step 3.3: Populate `DIM_MATH_KB`**

Same pattern. Chapter list per research notes (8 chapters, ~75 lessons): (7) Numbers to 20, 11; (8) Number Bonds, 14; (9) Addition, 12; (10) Subtraction, 10; (11) Addition and Subtraction, 6; (12) Numbers to 100, 11; (13) Time, 5; (14) Money, 6.

- [ ] **Step 3.4: Populate `DIM_MATH_2A`**

7 chapters, ~55 lessons: (1) Numbers to 1,000, 8; (2) Addition and Subtraction Part 1, 5; (3) Addition and Subtraction Part 2, 12; (4) Length, 8; (5) Weight, 4; (6) Multiplication and Division intro, 7; (7) Multiplication and Division of 2, 5, 10, 11.

- [ ] **Step 3.5: Populate `DIM_MATH_2B`**

8 chapters: (8) Mental Calculation; (9) Multiplication and Division of 3 and 4; (10) Money — dollars/cents; (11) Fractions; (12) Time; (13) Capacity; (14) Graphs; (15) Shapes. Lesson counts not in research notes — fetch the [2B textbook page](https://www.singaporemath.com/products/dimensions-math-textbook-2b) to enumerate.

- [ ] **Step 3.6: Run seed and verify entry count**

```bash
cd ~/Downloads/atozfamily-planner && npm run db:seed
```

Expected log includes four `dim-math-*: N entries` lines summing to ~240-250.

Then run via psql or Prisma Studio:
```bash
echo "SELECT \"sequenceId\", count(*) FROM \"SequenceEntry\" WHERE \"sequenceId\" LIKE 'dim-math-%' GROUP BY 1 ORDER BY 1;" | npx prisma db execute --stdin
```
Expected: four rows totaling ~240-250.

- [ ] **Step 3.7: Commit**

```bash
git add prisma/seeds/dimensions-math.ts
git commit -m "feat(seed): digitize Singapore Dimensions Math KA/KB/2A/2B sequences"
```

---

## Task 4: Seed Logic of English Foundations sequences (A, B, C, D)

**Files:**
- Modify: `prisma/seeds/loe-foundations.ts`

Source: [LOE Foundations A-D Scope & Sequence PDF](https://loe-assets.logicofenglish.com/downloads/foundations-a-b-c-d-ss.pdf) — 40 numbered lessons + 8 reviews per book = 48 per book × 4 books = ~192 entries (192, not 160 — research notes undercounted by omitting reviews).

- [ ] **Step 4.1: Define the file using the same helper pattern as Task 3**

Replace the file contents:

```ts
import { PrismaClient, Subject } from '@prisma/client';

type EntryInput = {
  unit: string;
  lessonRef: string;
  topic: string;
  estimatedMinutes?: number;
  isReview?: boolean;
};

type SequenceInput = {
  id: string;
  name: string;
  publisher: string;
  ageRangeMin: number;
  ageRangeMax: number;
  sourceUrl: string;
  entries: EntryInput[];
};

async function upsertSequence(prisma: PrismaClient, seq: SequenceInput) {
  await prisma.curriculumSequence.upsert({
    where: { id: seq.id },
    update: {
      name: seq.name, publisher: seq.publisher, subject: Subject.ENGLISH,
      ageRangeMin: seq.ageRangeMin, ageRangeMax: seq.ageRangeMax, sourceUrl: seq.sourceUrl,
    },
    create: {
      id: seq.id, name: seq.name, publisher: seq.publisher, subject: Subject.ENGLISH,
      ageRangeMin: seq.ageRangeMin, ageRangeMax: seq.ageRangeMax, sourceUrl: seq.sourceUrl,
    },
  });
  for (let i = 0; i < seq.entries.length; i++) {
    const e = seq.entries[i];
    await prisma.sequenceEntry.upsert({
      where: { sequenceId_orderIndex: { sequenceId: seq.id, orderIndex: i + 1 } },
      update: { unit: e.unit, lessonRef: e.lessonRef, topic: e.topic, estimatedMinutes: e.estimatedMinutes ?? null, isReview: e.isReview ?? false },
      create: { sequenceId: seq.id, orderIndex: i + 1, unit: e.unit, lessonRef: e.lessonRef, topic: e.topic, estimatedMinutes: e.estimatedMinutes ?? null, isReview: e.isReview ?? false },
    });
  }
  console.log(`  • ${seq.id}: ${seq.entries.length} entries`);
}

export async function seedLogicOfEnglish(prisma: PrismaClient) {
  await upsertSequence(prisma, LOE_A);
  await upsertSequence(prisma, LOE_B);
  await upsertSequence(prisma, LOE_C);
  await upsertSequence(prisma, LOE_D);
}
```

- [ ] **Step 4.2: Populate the four sequences**

Append four `const LOE_A: SequenceInput = { ... }` blocks. Each has 48 entries. Use this pattern for a single entry:

```ts
{ unit: 'Unit 1', lessonRef: 'Lesson 1', topic: 'Phonogram /a/; manuscript a', estimatedMinutes: 25 },
```

Reviews (every 5 lessons) use `isReview: true` and `topic: 'Review of Lessons N-(N+4)'`.

**Action for the implementing agent:** Fetch the [LOE Foundations A-D Scope & Sequence PDF](https://loe-assets.logicofenglish.com/downloads/foundations-a-b-c-d-ss.pdf) and extract all 48 lessons per book. Maintain the numbering convention: A is lessons 1-40 + 8 reviews; B is lessons 41-80 + 8 reviews; C is 81-120 + 8 reviews; D is 121-160 + 8 reviews. Per research notes:
- A: ages 4-5; estimatedMinutes ~25.
- B: ages 5-6; estimatedMinutes ~35.
- C: ages 6-7; estimatedMinutes ~40.
- D: ages 7-8; estimatedMinutes ~50.

If PDF extraction is awkward, dispatch a subagent to enumerate lessons from the public-facing samples on logicofenglish.com.

- [ ] **Step 4.3: Run seed + verify**

```bash
cd ~/Downloads/atozfamily-planner && npm run db:seed
echo "SELECT \"sequenceId\", count(*) FROM \"SequenceEntry\" WHERE \"sequenceId\" LIKE 'loe-%' GROUP BY 1;" | npx prisma db execute --stdin
```
Expected: four rows of ~48 each.

- [ ] **Step 4.4: Commit**

```bash
git add prisma/seeds/loe-foundations.ts
git commit -m "feat(seed): digitize LOE Foundations A/B/C/D sequences"
```

---

## Task 5: Seed Story of the World Vol 1 resources (42 chapters)

**Files:**
- Modify: `prisma/seeds/story-of-the-world-v1.ts`

Source: [SOTW Vol 1 25th Anniversary Edition](https://welltrainedmind.com/p/sotw-1-25th-text/). Activity book provides reading lists and craft suggestions per chapter; this seed paraphrases activity ideas (never reproduces the publisher's prose).

- [ ] **Step 5.1: Define the file**

```ts
import { PrismaClient, ResourceType, Subject } from '@prisma/client';

type ResourceInput = {
  id: string;
  title: string;
  description: string;
  weekHint: number;
  tier7Activity: { instructions: string; materials: string[]; minutes: number };
  tier4Activity: { instructions: string; materials: string[]; minutes: number };
  bookList: string[];
  fieldTripLocation?: string;
  videoUrl?: string;
};

const TERM_IDS_ALL = ['summer-2026', 'fall-2026', 'spring-2027', 'summer-2027'];

async function upsertResource(prisma: PrismaClient, r: ResourceInput) {
  await prisma.curriculumResource.upsert({
    where: { id: r.id },
    update: {
      title: r.title, description: r.description, weekHint: r.weekHint,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      bookList: r.bookList, fieldTripLocation: r.fieldTripLocation ?? null,
      videoUrl: r.videoUrl ?? null,
      framework: 'SOTW Vol 1', subject: Subject.HISTORY, type: ResourceType.PROJECT,
      ageRange: '4-8', season: 'any', termIds: TERM_IDS_ALL,
      sourceUrl: 'https://welltrainedmind.com/p/sotw-1-25th-text/',
      tags: ['classical', 'read-aloud', 'multi-age'],
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
      active: true,
    },
    create: {
      id: r.id, title: r.title, description: r.description, weekHint: r.weekHint,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      bookList: r.bookList, fieldTripLocation: r.fieldTripLocation ?? null,
      videoUrl: r.videoUrl ?? null,
      framework: 'SOTW Vol 1', subject: Subject.HISTORY, type: ResourceType.PROJECT,
      ageRange: '4-8', season: 'any', termIds: TERM_IDS_ALL,
      sourceUrl: 'https://welltrainedmind.com/p/sotw-1-25th-text/',
      tags: ['classical', 'read-aloud', 'multi-age'],
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
      active: true,
    },
  });
}

export async function seedStoryOfTheWorldV1(prisma: PrismaClient) {
  for (const r of SOTW_V1_CHAPTERS) {
    await upsertResource(prisma, r);
  }
  console.log(`  • SOTW Vol 1: ${SOTW_V1_CHAPTERS.length} chapters seeded`);
}

const SOTW_V1_CHAPTERS: ResourceInput[] = [
  {
    id: 'sotw-v1-ch-01',
    title: 'The Earliest People',
    description: 'Nomadic life; hunting and gathering before farming.',
    weekHint: 1,
    tier7Activity: {
      instructions: 'Read the chapter aloud. Have the child narrate it back. Color the map of early human migration. Write 3 sentences describing what a nomad does.',
      materials: ['SOTW Vol 1 text', 'activity book map page', 'colored pencils', 'lined paper'],
      minutes: 30,
    },
    tier4Activity: {
      instructions: 'Listen to the chapter. Act out being a nomad walking and looking for food. Color the map together.',
      materials: ['SOTW Vol 1 text or audiobook', 'activity book map page', 'crayons'],
      minutes: 20,
    },
    bookList: ['The First Drawing by Mordicai Gerstein', 'Stone Age Boy by Satoshi Kitamura'],
    fieldTripLocation: 'Oregon Historical Society (early human exhibits, Portland)',
  },
  // ...continue for all 42 chapters of the 25th-Anniversary Edition.
];
```

**Action for the implementing agent:** The 25th-Anniversary Expanded Edition (released 2026) added chapters on China, Korea, the Silk Road, King Herod, and Masada to the original 42 — verify the final chapter count from the [Well-Trained Mind Press product page](https://welltrainedmind.com/p/sotw-1-25th-text/) or Amazon listing. Write one `ResourceInput` per chapter, paraphrasing activity suggestions from the activity book (do not copy its prose). Use Portland-area field-trip locations where they fit: Oregon Historical Society, Portland Art Museum (ancient/medieval galleries), OMSI (ancient civilizations exhibits), World Forestry Center, Hoyt Arboretum. If a chapter has no obvious local tie, leave `fieldTripLocation` undefined.

- [ ] **Step 5.2: Run seed + verify**

```bash
cd ~/Downloads/atozfamily-planner && npm run db:seed
echo "SELECT count(*) FROM \"CurriculumResource\" WHERE framework = 'SOTW Vol 1';" | npx prisma db execute --stdin
```
Expected: 42 (or whatever the 25th Anniv ToC actually contains).

- [ ] **Step 5.3: Commit**

```bash
git add prisma/seeds/story-of-the-world-v1.ts
git commit -m "feat(seed): Story of the World Vol 1 chapters with tier-7/tier-4 activities"
```

---

## Task 6: Seed Mystery Science K-2 resources (~30)

**Files:**
- Modify: `prisma/seeds/mystery-science.ts`

Source: [Mystery Science homeschool packs](https://mysteryscience.com/packs) — browse K-2 lessons. Each lesson has a public landing page with title, materials, and lesson description.

- [ ] **Step 6.1: Define the file**

```ts
import { PrismaClient, ResourceType, Subject } from '@prisma/client';

type ResourceInput = {
  id: string;
  title: string;
  description: string;
  weekHint: number;
  season: string;            // "summer" | "fall" | "spring" | "any"
  termIds: string[];
  tier7Activity: { instructions: string; materials: string[]; minutes: number };
  tier4Activity: { instructions: string; materials: string[]; minutes: number };
  sourceUrl: string;
  videoUrl?: string;
};

async function upsertResource(prisma: PrismaClient, r: ResourceInput) {
  const fixed = {
    framework: 'Mystery Science',
    subject: Subject.SCIENCE,
    type: ResourceType.VIDEO,
    ageRange: '5-8',
    tags: ['video-led', 'hands-on', 'indoor', 'monday'],
    bookList: [] as string[],
    active: true,
  };
  await prisma.curriculumResource.upsert({
    where: { id: r.id },
    update: {
      ...fixed,
      title: r.title, description: r.description, weekHint: r.weekHint, season: r.season, termIds: r.termIds,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      sourceUrl: r.sourceUrl, videoUrl: r.videoUrl ?? r.sourceUrl,
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
    },
    create: {
      id: r.id,
      ...fixed,
      title: r.title, description: r.description, weekHint: r.weekHint, season: r.season, termIds: r.termIds,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      sourceUrl: r.sourceUrl, videoUrl: r.videoUrl ?? r.sourceUrl,
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
    },
  });
}

export async function seedMysteryScience(prisma: PrismaClient) {
  for (const r of MYSTERY_SCIENCE_LESSONS) {
    await upsertResource(prisma, r);
  }
  console.log(`  • Mystery Science: ${MYSTERY_SCIENCE_LESSONS.length} lessons seeded`);
}

const MYSTERY_SCIENCE_LESSONS: ResourceInput[] = [
  {
    id: 'mystery-science-animal-architects',
    title: 'Animal Architects (How do tiny ants build huge cities?)',
    description: 'Investigate how ants build elaborate underground colonies. Hands-on: build a paper ant tunnel.',
    weekHint: 1,
    season: 'summer',
    termIds: ['summer-2026'],
    tier7Activity: {
      instructions: 'Watch the lesson video. Pause at the activity step. Build the paper ant tunnel from the printable. Then write 2 sentences explaining how ants share work.',
      materials: ['paper', 'scissors', 'tape', 'printout from lesson page', 'pencil + paper'],
      minutes: 45,
    },
    tier4Activity: {
      instructions: 'Watch the lesson video alongside older sibling. Help cut/tape pieces. Draw a picture of an ant in its tunnel.',
      materials: ['crayons', 'paper', 'pre-cut pieces (parent helps)'],
      minutes: 25,
    },
    sourceUrl: 'https://mysteryscience.com/animals/mystery-2/animal-trait-variations/3',
  },
  // ...continue for ~30 total lessons.
];
```

**Action for the implementing agent:** Pick ~30 K-2 Mystery Science lessons covering Life Science, Earth & Space, Physical Science, and Engineering (roughly 7-8 each). Use the public lesson pages at [mysteryscience.com/packs](https://mysteryscience.com/packs) to fill `title`, `description`, materials. Tag each with `weekHint` 1-30 (spread evenly across the year) and `season` according to topic ("weather" → fall/spring). `termIds` should include the term(s) the `weekHint` falls into.

- [ ] **Step 6.2: Run seed + verify**

```bash
cd ~/Downloads/atozfamily-planner && npm run db:seed
echo "SELECT count(*) FROM \"CurriculumResource\" WHERE framework = 'Mystery Science';" | npx prisma db execute --stdin
```
Expected: ~30.

- [ ] **Step 6.3: Commit**

```bash
git add prisma/seeds/mystery-science.ts
git commit -m "feat(seed): Mystery Science K-2 resources (~30, Mon indoor block)"
```

---

## Task 7: Seed Outdoor Hour Challenge / PNW nature-study resources (~35)

**Files:**
- Modify: `prisma/seeds/outdoor-hour-challenge.ts`

Sources:
- [Homeschool Nature Study](https://naturestudyhomeschool.com/) (challenge index)
- [Handbook of Nature Study by Anna Comstock](https://www.amazon.com/Handbook-Nature-Study-Anna-Comstock/dp/0801493846)
- [Chickie & Roo Oregon Nature Guide](https://www.chickieandroo.com/product/oregon-nature-guide/) (PNW-specific seasonal topics)

- [ ] **Step 7.1: Define the file**

```ts
import { PrismaClient, ResourceType, Subject } from '@prisma/client';

type ResourceInput = {
  id: string;
  title: string;
  description: string;
  weekHint: number;
  season: string;
  termIds: string[];
  type: ResourceType;        // FIELD_TRIP if specific location, else PROJECT
  tier7Activity: { instructions: string; materials: string[]; minutes: number };
  tier4Activity: { instructions: string; materials: string[]; minutes: number };
  fieldTripLocation?: string;
  sourceUrl?: string;
  bookList?: string[];
};

async function upsertResource(prisma: PrismaClient, r: ResourceInput) {
  const fixed = {
    framework: 'OHC',
    subject: Subject.SCIENCE,
    ageRange: '4-8',
    tags: ['outdoor', 'wednesday', 'charlotte-mason', 'pnw'],
    active: true,
  };
  await prisma.curriculumResource.upsert({
    where: { id: r.id },
    update: {
      ...fixed,
      type: r.type, title: r.title, description: r.description, weekHint: r.weekHint, season: r.season, termIds: r.termIds,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      fieldTripLocation: r.fieldTripLocation ?? null,
      sourceUrl: r.sourceUrl ?? null,
      bookList: r.bookList ?? [],
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
    },
    create: {
      id: r.id,
      ...fixed,
      type: r.type, title: r.title, description: r.description, weekHint: r.weekHint, season: r.season, termIds: r.termIds,
      activities: { tier7: r.tier7Activity, tier4: r.tier4Activity },
      fieldTripLocation: r.fieldTripLocation ?? null,
      sourceUrl: r.sourceUrl ?? null,
      bookList: r.bookList ?? [],
      materials: [...r.tier7Activity.materials, ...r.tier4Activity.materials],
    },
  });
}

export async function seedOutdoorHourChallenge(prisma: PrismaClient) {
  for (const r of OHC_PNW_TOPICS) {
    await upsertResource(prisma, r);
  }
  console.log(`  • OHC (PNW): ${OHC_PNW_TOPICS.length} topics seeded`);
}

const OHC_PNW_TOPICS: ResourceInput[] = [
  {
    id: 'ohc-pnw-tide-pools-cape-perpetua',
    title: 'Tide pool exploration — Cape Perpetua',
    description: 'Observe Pacific tide pool inhabitants: anemones, hermit crabs, sea stars, mussels. Best at low tide (~1.5 hours either side).',
    weekHint: 4,
    season: 'summer',
    termIds: ['summer-2026'],
    type: ResourceType.FIELD_TRIP,
    tier7Activity: {
      instructions: 'Bring a nature journal. Sketch 3 different creatures observed. Label them. Note water temperature and time of day.',
      materials: ['nature journal', 'pencil', 'colored pencils', 'waterproof boots', 'tide chart (printed)'],
      minutes: 90,
    },
    tier4Activity: {
      instructions: 'Help find creatures. Collect 3 shells (no live animals). Dictate observations to parent for the journal.',
      materials: ['small collection bucket', 'waterproof boots', 'snack'],
      minutes: 60,
    },
    fieldTripLocation: 'Cape Perpetua, Yachats, OR',
    sourceUrl: 'https://www.fs.usda.gov/recarea/siuslaw/recarea/?recid=42265',
  },
  // ...continue for ~35 total topics.
];
```

**Action for the implementing agent:** Seed ~35 PNW-specific nature topics, distributed by season:
- Summer (8-10): tide pools (Cape Perpetua, Cannon Beach), wildflower walks, blackberry identification, garter snake/banana slug observation, lake ecology (Hagg Lake), forest canopy.
- Fall (8-10): salmon spawning (Tualatin River), mushroom hunting safety, leaf identification (Doug fir vs hemlock vs cedar), nut/cone collection.
- Spring (8-10): nest watching, spring ephemerals (trillium), tadpole observation, songbird ID by ear.
- Winter / any-season (7-9): cloud watching, moss & lichen study, bird feeder counts, animal track ID, weather journaling.

Each carries a tier-7 activity (sketch + journal entry with 3 observations) and tier-4 activity (collect 3 objects + dictate observations to parent). `fieldTripLocation` set to specific PNW spots (Forest Park, Tualatin Hills Nature Park, Hagg Lake, Cape Perpetua, Sauvie Island, Hoyt Arboretum, Tryon Creek State Park).

- [ ] **Step 7.2: Run seed + verify**

```bash
cd ~/Downloads/atozfamily-planner && npm run db:seed
echo "SELECT season, count(*) FROM \"CurriculumResource\" WHERE framework = 'OHC' GROUP BY 1;" | npx prisma db execute --stdin
```
Expected: roughly 8-10 per season.

- [ ] **Step 7.3: Commit**

```bash
git add prisma/seeds/outdoor-hour-challenge.ts
git commit -m "feat(seed): OHC + PNW nature-study resources (~35, Wed outdoor block)"
```

---

## Task 8: Seed Build Your Library Level 0 picture-book supplements (~30)

**Files:**
- Modify: `prisma/seeds/build-your-library-l0.ts`

Source: [Build Your Library Level 0](https://buildyourlibrary.com/purchase-level-0-curriculum/) — picture-book-driven, world animals + continents.

- [ ] **Step 8.1: Define the file**

```ts
import { PrismaClient, ResourceType, Subject } from '@prisma/client';

type ResourceInput = {
  id: string;
  title: string;
  bookTitle: string;
  description: string;
  weekHint: number;
  termIds: string[];
  tier4Activity: { instructions: string; materials: string[]; minutes: number };
};

const TERM_IDS_ALL = ['summer-2026', 'fall-2026', 'spring-2027', 'summer-2027'];

async function upsertResource(prisma: PrismaClient, r: ResourceInput) {
  const fixed = {
    framework: 'BYL Level 0',
    subject: Subject.HISTORY,
    type: ResourceType.BOOK,
    ageRange: '4-6',
    season: 'any',
    tags: ['picture-book', 'tier-4-supplement', 'multi-age'],
    active: true,
  };
  await prisma.curriculumResource.upsert({
    where: { id: r.id },
    update: {
      ...fixed,
      title: r.title, description: r.description, weekHint: r.weekHint, termIds: r.termIds,
      bookList: [r.bookTitle],
      activities: { tier4: r.tier4Activity },
      materials: r.tier4Activity.materials,
      sourceUrl: 'https://buildyourlibrary.com/purchase-level-0-curriculum/',
    },
    create: {
      id: r.id,
      ...fixed,
      title: r.title, description: r.description, weekHint: r.weekHint, termIds: r.termIds,
      bookList: [r.bookTitle],
      activities: { tier4: r.tier4Activity },
      materials: r.tier4Activity.materials,
      sourceUrl: 'https://buildyourlibrary.com/purchase-level-0-curriculum/',
    },
  });
}

export async function seedBuildYourLibraryL0(prisma: PrismaClient) {
  for (const r of BYL_L0_PICKS) {
    await upsertResource(prisma, r);
  }
  console.log(`  • BYL Level 0: ${BYL_L0_PICKS.length} supplements seeded`);
}

const BYL_L0_PICKS: ResourceInput[] = [
  {
    id: 'byl-l0-this-is-how-we-do-it',
    title: 'Children around the world — "This Is How We Do It"',
    bookTitle: 'This Is How We Do It: One Day in the Lives of Seven Kids from Around the World by Matt Lamothe',
    description: 'Picture-book introduction to daily life of children on different continents. Pairs with SOTW Vol 1 opening chapters on early civilizations.',
    weekHint: 1,
    termIds: TERM_IDS_ALL,
    tier4Activity: {
      instructions: 'Read the book aloud. Help Middle find each child on the globe. Color a flag from one country featured.',
      materials: ['the book', 'globe or world map', 'flag printout', 'crayons'],
      minutes: 20,
    },
  },
  // ...continue for ~30 total picks.
];
```

**Action for the implementing agent:** Pick ~30 picture books from BYL Level 0's bibliography covering 7 continents + world animals + simple geography. Each gets `bookTitle` (Title + Author), brief description, suggested tier-4 activity (e.g., "Find the country on the globe; color a flag template"). The published [BYL Level 0 PDF](https://buildyourlibrary.com/purchase-level-0-curriculum/) is paywalled; use Cathy Duffy's review and public BYL blog posts to enumerate the booklist, or dispatch a `general-purpose` subagent to fetch the book list from third-party reviews.

- [ ] **Step 8.2: Run seed + verify**

```bash
cd ~/Downloads/atozfamily-planner && npm run db:seed
echo "SELECT count(*) FROM \"CurriculumResource\" WHERE framework = 'BYL Level 0';" | npx prisma db execute --stdin
```
Expected: ~30.

- [ ] **Step 8.3: Commit**

```bash
git add prisma/seeds/build-your-library-l0.ts
git commit -m "feat(seed): Build Your Library Level 0 picture-book supplements (~30)"
```

---

## Task 9: Library API route — list with filters

**Files:**
- Create: `src/app/api/library/route.ts`
- Create: `src/app/api/library/[id]/route.ts`

- [ ] **Step 9.1: Create `src/app/api/library/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Subject } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const subject = sp.get('subject') as Subject | null;
  const framework = sp.get('framework');
  const season = sp.get('season');
  const term = sp.get('term');
  const ageMin = sp.get('ageMin') ? parseInt(sp.get('ageMin')!, 10) : null;
  const q = sp.get('q')?.trim().toLowerCase();

  const where: any = { active: true, deletedAt: null };
  if (subject) where.subject = subject;
  if (framework) where.framework = framework;
  if (season) where.season = season;
  if (term) where.termIds = { has: term };
  if (ageMin !== null) where.ageRange = { contains: String(ageMin) };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const resources = await prisma.curriculumResource.findMany({
    where,
    orderBy: [{ framework: 'asc' }, { weekHint: 'asc' }, { title: 'asc' }],
    take: 200,
  });

  return NextResponse.json({ resources });
}
```

- [ ] **Step 9.2: Create `src/app/api/library/[id]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const resource = await prisma.curriculumResource.findUnique({ where: { id: params.id } });
  if (!resource || !resource.active) return NextResponse.json({ error: 'not-found' }, { status: 404 });

  return NextResponse.json({ resource });
}
```

- [ ] **Step 9.3: Verify manually**

Start dev server: `cd ~/Downloads/atozfamily-planner && npm run dev`

In another terminal:
```bash
curl -s "http://localhost:3000/api/library?subject=SCIENCE&framework=Mystery%20Science" | head -c 500
```
Expected: JSON with `resources: [...]` containing ~30 Mystery Science rows.

```bash
curl -s "http://localhost:3000/api/library?subject=HISTORY&framework=SOTW%20Vol%201" | head -c 500
```
Expected: JSON with ~42 SOTW rows.

```bash
curl -s "http://localhost:3000/api/library?q=tide" | head -c 500
```
Expected: JSON with tide-pool OHC rows (substring search).

- [ ] **Step 9.4: Commit**

```bash
git add src/app/api/library/
git commit -m "feat(api): GET /api/library with filters (subject, framework, season, term, ageMin, q)"
```

---

## Task 10: Library UI tab — browse + filter

**Files:**
- Create: `src/components/library/LibraryTab.tsx`
- Create: `src/components/library/ResourceCard.tsx`
- Create: `src/components/library/ResourceDetailDrawer.tsx`

- [ ] **Step 10.1: Create `ResourceCard.tsx`**

```tsx
'use client';
import { BookOpen, Video, Compass, Wrench, MapPin, FileText, Sparkles } from 'lucide-react';

type Resource = {
  id: string;
  title: string;
  description: string | null;
  framework: string | null;
  subject: string;
  ageRange: string | null;
  season: string | null;
  weekHint: number | null;
  type: string;
  materials: string[];
  bookList: string[];
  fieldTripLocation: string | null;
};

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  EXPERIMENT: Sparkles, BOOK: BookOpen, ARTICLE: FileText, VIDEO: Video,
  PROJECT: Wrench, WORKSHEET: FileText, FIELD_TRIP: MapPin, OTHER: Compass,
};

export function ResourceCard({ resource, onClick }: { resource: Resource; onClick: () => void }) {
  const Icon = TYPE_ICON[resource.type] ?? Compass;
  return (
    <button onClick={onClick}
      className="text-left bg-paper border border-rule rounded-lg p-4 hover:border-accent transition w-full">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-accent"><Icon size={18} /></div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">{resource.title}</div>
          <div className="text-xs text-ink-muted mt-0.5 line-clamp-2">{resource.description}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {resource.framework && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft">{resource.framework}</span>}
            {resource.ageRange && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft">ages {resource.ageRange}</span>}
            {resource.season && resource.season !== 'any' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft">{resource.season}</span>}
            {resource.fieldTripLocation && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft inline-flex items-center gap-0.5"><MapPin size={9} /> trip</span>}
          </div>
        </div>
      </div>
    </button>
  );
}

export type { Resource };
```

- [ ] **Step 10.2: Create `ResourceDetailDrawer.tsx`**

```tsx
'use client';
import { X, ExternalLink, MapPin, BookOpen } from 'lucide-react';
import type { Resource } from './ResourceCard';

type ResourceFull = Resource & {
  url: string | null;
  sourceUrl: string | null;
  videoUrl: string | null;
  activities: { tier7?: any; tier4?: any } | null;
  notes: string | null;
  tags: string[];
};

export function ResourceDetailDrawer({ resource, onClose }: { resource: ResourceFull | null; onClose: () => void }) {
  if (!resource) return null;
  const tier7 = resource.activities?.tier7;
  const tier4 = resource.activities?.tier4;

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex justify-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-cream w-full max-w-lg h-full overflow-y-auto p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-ink-muted uppercase tracking-wider">{resource.framework} · {resource.subject}</div>
            <h2 className="font-display text-xl font-semibold leading-tight mt-1">{resource.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-ink-muted hover:text-ink"><X size={18} /></button>
        </div>

        {resource.description && <p className="text-sm text-ink-soft mb-4">{resource.description}</p>}

        {tier7 && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Tier 7 (Eldest)</div>
            <div className="bg-paper border border-rule rounded p-3 text-sm">
              <div>{tier7.instructions}</div>
              {tier7.materials?.length > 0 && <div className="text-xs text-ink-muted mt-2">Materials: {tier7.materials.join(', ')}</div>}
              {tier7.minutes && <div className="text-xs text-ink-muted mt-1">≈ {tier7.minutes} min</div>}
            </div>
          </section>
        )}

        {tier4 && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Tier 4 (Middle)</div>
            <div className="bg-paper border border-rule rounded p-3 text-sm">
              <div>{tier4.instructions}</div>
              {tier4.materials?.length > 0 && <div className="text-xs text-ink-muted mt-2">Materials: {tier4.materials.join(', ')}</div>}
              {tier4.minutes && <div className="text-xs text-ink-muted mt-1">≈ {tier4.minutes} min</div>}
            </div>
          </section>
        )}

        {resource.bookList?.length > 0 && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Books</div>
            <ul className="text-sm space-y-1">
              {resource.bookList.map((b, i) => (
                <li key={i} className="flex items-start gap-2"><BookOpen size={12} className="mt-1 flex-shrink-0 text-ink-muted" />{b}</li>
              ))}
            </ul>
          </section>
        )}

        {resource.fieldTripLocation && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Field trip</div>
            <div className="text-sm flex items-center gap-2"><MapPin size={14} className="text-ink-muted" />{resource.fieldTripLocation}</div>
          </section>
        )}

        {(resource.sourceUrl || resource.videoUrl) && (
          <section className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Source</div>
            {resource.sourceUrl && (
              <a href={resource.sourceUrl} target="_blank" rel="noreferrer"
                 className="text-sm text-accent flex items-center gap-1 hover:underline">
                <ExternalLink size={12} /> {resource.sourceUrl}
              </a>
            )}
            {resource.videoUrl && resource.videoUrl !== resource.sourceUrl && (
              <a href={resource.videoUrl} target="_blank" rel="noreferrer"
                 className="text-sm text-accent flex items-center gap-1 hover:underline mt-1">
                <ExternalLink size={12} /> Video: {resource.videoUrl}
              </a>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 10.3: Create `LibraryTab.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { ResourceCard, type Resource } from './ResourceCard';
import { ResourceDetailDrawer } from './ResourceDetailDrawer';

const SUBJECTS = ['', 'SCIENCE', 'HISTORY', 'MATH', 'ENGLISH', 'ART', 'MUSIC', 'PE', 'OTHER'];
const FRAMEWORKS = ['', 'Mystery Science', 'OHC', 'SOTW Vol 1', 'BYL Level 0'];
const SEASONS = ['', 'summer', 'fall', 'spring', 'any'];

export function LibraryTab({ termIds }: { termIds: string[] }) {
  const [subject, setSubject] = useState('');
  const [framework, setFramework] = useState('');
  const [season, setSeason] = useState('');
  const [term, setTerm] = useState('');
  const [q, setQ] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (subject) params.set('subject', subject);
    if (framework) params.set('framework', framework);
    if (season) params.set('season', season);
    if (term) params.set('term', term);
    if (q) params.set('q', q);
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/library?${params.toString()}`);
      const j = await res.json();
      setResources(j.resources ?? []);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [subject, framework, season, term, q]);

  async function openDetail(id: string) {
    const res = await fetch(`/api/library/${id}`);
    const j = await res.json();
    setDetail(j.resource);
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold">Library</h1>
        <p className="text-sm text-ink-muted">Curated experiments, books, videos, and field trips for the family content block.</p>
      </div>

      <div className="bg-paper border border-rule rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or description..."
            className="w-full pl-7 pr-2 py-1.5 text-sm border border-rule rounded bg-cream" />
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          {SUBJECTS.map((s) => <option key={s} value={s}>{s || 'All subjects'}</option>)}
        </select>
        <select value={framework} onChange={(e) => setFramework(e.target.value)} className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          {FRAMEWORKS.map((f) => <option key={f} value={f}>{f || 'All frameworks'}</option>)}
        </select>
        <select value={season} onChange={(e) => setSeason(e.target.value)} className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          {SEASONS.map((s) => <option key={s} value={s}>{s || 'All seasons'}</option>)}
        </select>
        <select value={term} onChange={(e) => setTerm(e.target.value)} className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          <option value="">All terms</option>
          {termIds.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="text-xs text-ink-muted mb-2">{loading ? 'Loading...' : `${resources.length} resources`}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((r) => <ResourceCard key={r.id} resource={r} onClick={() => openDetail(r.id)} />)}
      </div>

      <ResourceDetailDrawer resource={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
```

- [ ] **Step 10.4: Type-check**

Run: `cd ~/Downloads/atozfamily-planner && npx tsc --noEmit`
Expected: no errors. If errors mention missing `framework` etc. fields on Resource, re-check that `prisma generate` ran (`npx prisma generate`).

- [ ] **Step 10.5: Commit**

```bash
git add src/components/library/
git commit -m "feat(ui): Library tab — browse, filter, detail drawer"
```

---

## Task 11: Suggestions API routes

**Files:**
- Create: `src/app/api/suggestions/route.ts`
- Create: `src/app/api/suggestions/[id]/route.ts`

- [ ] **Step 11.1: Create `src/app/api/suggestions/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { SuggestionStatus } from '@prisma/client';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const suggestions = await prisma.suggestion.findMany({
    orderBy: [{ status: 'asc' }, { upvotes: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { email: true, name: true } } },
  });
  return NextResponse.json({ suggestions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const title = (body.title ?? '').trim();
  const text = (body.body ?? '').trim();
  const category = body.category ? String(body.category) : null;

  if (!title || !text) return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  if (title.length > 200) return NextResponse.json({ error: 'title too long' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  const created = await prisma.suggestion.create({
    data: { authorId: user.id, title, body: text, category, status: SuggestionStatus.PROPOSED },
  });

  await audit({ userId: user.id, action: 'suggestion.create', entityType: 'Suggestion', entityId: created.id, payload: { title, category } });

  return NextResponse.json({ suggestion: created }, { status: 201 });
}
```

- [ ] **Step 11.2: Create `src/app/api/suggestions/[id]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { SuggestionStatus } from '@prisma/client';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = new Set(Object.values(SuggestionStatus));

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: any = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.has(body.status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    data.status = body.status;
  }
  if (body.upvote === true) {
    data.upvotes = { increment: 1 };
  }
  if (body.ghIssueUrl !== undefined) data.ghIssueUrl = body.ghIssueUrl;
  if (body.ghPrUrl !== undefined) data.ghPrUrl = body.ghPrUrl;

  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'no fields to update' }, { status: 400 });

  const updated = await prisma.suggestion.update({ where: { id: params.id }, data });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  await audit({ userId: user?.id, action: 'suggestion.update', entityType: 'Suggestion', entityId: params.id, payload: data });

  return NextResponse.json({ suggestion: updated });
}
```

- [ ] **Step 11.3: Verify manually**

Start dev server (`npm run dev`). In another terminal:
```bash
curl -s http://localhost:3000/api/suggestions | head -c 200
```
Expected: `{"suggestions":[]}` (empty array — auth bypass returns default Family user).

```bash
curl -s -X POST http://localhost:3000/api/suggestions \
  -H 'content-type: application/json' \
  -d '{"title":"Test suggestion","body":"From curl","category":"ui"}' | head -c 300
```
Expected: 201 with the created suggestion.

```bash
curl -s http://localhost:3000/api/suggestions | head -c 500
```
Expected: now includes the test suggestion with status PROPOSED.

- [ ] **Step 11.4: Commit**

```bash
git add src/app/api/suggestions/
git commit -m "feat(api): suggestions CRUD — list, create, update status/upvotes/gh links"
```

---

## Task 12: Suggestions UI tab

**Files:**
- Create: `src/components/suggestions/SuggestionForm.tsx`
- Create: `src/components/suggestions/SuggestionRow.tsx`
- Create: `src/components/suggestions/SuggestionsTab.tsx`

- [ ] **Step 12.1: Create `SuggestionForm.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';

const CATEGORIES = ['', 'library', 'ui', 'tracking', 'bug', 'other'];

export function SuggestionForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), body: body.trim(), category: category || null }),
    });
    setSubmitting(false);
    if (res.ok) {
      setTitle(''); setBody(''); setCategory('');
      onCreated();
    }
  }

  return (
    <form onSubmit={submit} className="bg-paper border border-rule rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Plus size={16} /> <span className="font-semibold text-sm">New suggestion</span>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title (required)"
        className="w-full px-2 py-1.5 text-sm border border-rule rounded bg-cream mb-2" maxLength={200} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you want? Why? (markdown OK) (required)"
        className="w-full px-2 py-1.5 text-sm border border-rule rounded bg-cream mb-2 h-24 font-body" />
      <div className="flex items-center gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-rule rounded px-2 py-1.5 bg-cream">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'category...'}</option>)}
        </select>
        <button type="submit" disabled={submitting || !title.trim() || !body.trim()}
          className="px-3 py-1.5 text-sm bg-accent text-cream rounded disabled:opacity-50">
          {submitting ? 'Saving...' : 'Add'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 12.2: Create `SuggestionRow.tsx`**

```tsx
'use client';
import { ChevronUp, ExternalLink, GitPullRequest, GitBranch } from 'lucide-react';

type Suggestion = {
  id: string; title: string; body: string; category: string | null;
  status: string; upvotes: number; ghIssueUrl: string | null; ghPrUrl: string | null;
  createdAt: string; author: { email: string; name: string | null };
};

export function SuggestionRow({ suggestion, onUpvote }: { suggestion: Suggestion; onUpvote: () => void }) {
  return (
    <div className="bg-paper border border-rule rounded p-3 flex gap-3">
      <button onClick={onUpvote}
        className="flex flex-col items-center gap-0.5 px-2 py-1 border border-rule rounded hover:border-accent">
        <ChevronUp size={14} /><span className="text-xs font-mono">{suggestion.upvotes}</span>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-sm">{suggestion.title}</div>
          {suggestion.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream border border-rule text-ink-soft flex-shrink-0">{suggestion.category}</span>}
        </div>
        <div className="text-xs text-ink-soft mt-1 whitespace-pre-wrap line-clamp-4">{suggestion.body}</div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-ink-muted">
          <span>{suggestion.author.name ?? suggestion.author.email}</span>
          <span>·</span>
          <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
          {suggestion.ghIssueUrl && (
            <a href={suggestion.ghIssueUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-accent hover:underline">
              <GitBranch size={9} /> issue <ExternalLink size={9} />
            </a>
          )}
          {suggestion.ghPrUrl && (
            <a href={suggestion.ghPrUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-accent hover:underline">
              <GitPullRequest size={9} /> PR <ExternalLink size={9} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export type { Suggestion };
```

- [ ] **Step 12.3: Create `SuggestionsTab.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { SuggestionForm } from './SuggestionForm';
import { SuggestionRow, type Suggestion } from './SuggestionRow';

const STATUS_ORDER = ['PROPOSED', 'TRIAGED', 'IN_PROGRESS', 'DONE', 'WONT_DO'];
const STATUS_LABEL: Record<string, string> = {
  PROPOSED: 'Proposed', TRIAGED: 'Triaged', IN_PROGRESS: 'In progress', DONE: 'Done', WONT_DO: "Won't do",
};

export function SuggestionsTab() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  async function load() {
    const res = await fetch('/api/suggestions');
    const j = await res.json();
    setSuggestions(j.suggestions ?? []);
  }
  useEffect(() => { load(); }, []);

  async function upvote(id: string) {
    await fetch(`/api/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ upvote: true }),
    });
    load();
  }

  const grouped: Record<string, Suggestion[]> = {};
  for (const s of suggestions) {
    (grouped[s.status] ??= []).push(s);
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold">Suggestions</h1>
        <p className="text-sm text-ink-muted">Capture wishes here. Sync to GitHub via <code className="text-xs">npx tsx scripts/sync-suggestions.ts</code>.</p>
      </div>
      <SuggestionForm onCreated={load} />
      {STATUS_ORDER.map((status) => {
        const items = grouped[status] ?? [];
        if (items.length === 0) return null;
        return (
          <section key={status} className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              {STATUS_LABEL[status]} ({items.length})
            </div>
            <div className="space-y-2">
              {items.map((s) => <SuggestionRow key={s.id} suggestion={s} onUpvote={() => upvote(s.id)} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 12.4: Type-check**

Run: `cd ~/Downloads/atozfamily-planner && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 12.5: Commit**

```bash
git add src/components/suggestions/
git commit -m "feat(ui): Suggestions tab — form + grouped list + upvote"
```

---

## Task 13: Wire Library + Suggestions tabs into `PlannerApp.tsx`

**Files:**
- Modify: `src/components/PlannerApp.tsx`
- Modify: `src/app/planner/page.tsx`

- [ ] **Step 13.1: Import the new tabs in `PlannerApp.tsx`**

In `src/components/PlannerApp.tsx`, add to the imports near the top:

```ts
import { LibraryTab } from './library/LibraryTab';
import { SuggestionsTab } from './suggestions/SuggestionsTab';
import { BookMarked, Lightbulb } from 'lucide-react';
```

- [ ] **Step 13.2: Extend the `activeTab` union type**

Find:
```ts
const [activeTab, setActiveTab] = useState<'week' | 'year' | 'lessons' | 'reflections' | 'progress' | 'audit' | 'notes'>('week');
```
Replace with:
```ts
const [activeTab, setActiveTab] = useState<'week' | 'year' | 'lessons' | 'reflections' | 'progress' | 'audit' | 'notes' | 'library' | 'suggestions'>('week');
```

- [ ] **Step 13.3: Add tab buttons**

In the tab nav array around line 130-138 of `PlannerApp.tsx`, add two new entries before the closing `] as const`:

```ts
['library', 'Library', BookMarked],
['suggestions', 'Suggestions', Lightbulb],
```

- [ ] **Step 13.4: Add tab renderers**

In the `<main>` body around line 154-162, add two new conditional renders after `{activeTab === 'notes' && ...}`:

```tsx
{activeTab === 'library' && <LibraryTab termIds={terms.map((t) => t.id)} />}
{activeTab === 'suggestions' && <SuggestionsTab />}
```

- [ ] **Step 13.5: Run dev server and click through both tabs**

```bash
cd ~/Downloads/atozfamily-planner && npm run dev
```
Open http://localhost:3000/planner. Click "Library" — verify the filter UI renders, you see Mystery Science / SOTW / OHC cards, clicking a card opens the detail drawer. Click "Suggestions" — verify the form renders, submit a test suggestion, verify it shows up in the Proposed group, click the upvote button and verify the count increments.

- [ ] **Step 13.6: Commit**

```bash
git add src/components/PlannerApp.tsx
git commit -m "feat(ui): wire Library + Suggestions tabs into PlannerApp"
```

---

## Task 14: `sync-suggestions.ts` script — GitHub issue creation

**Files:**
- Create: `scripts/sync-suggestions.ts`

- [ ] **Step 14.1: Create the script**

```ts
#!/usr/bin/env tsx
/**
 * Sync PROPOSED suggestions to GitHub issues via `gh` CLI.
 *
 * Usage:
 *   npx tsx scripts/sync-suggestions.ts [--dry-run]
 *
 * Requires `gh` CLI installed and authenticated against the planner repo.
 * Reads PROPOSED rows, creates one issue per row, writes issue URL back,
 * and flips status to TRIAGED. Already-synced rows (ghIssueUrl != null) are
 * skipped — safe to re-run.
 */
import { PrismaClient, SuggestionStatus } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

function shellEscape(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

async function main() {
  const proposed = await prisma.suggestion.findMany({
    where: { status: SuggestionStatus.PROPOSED, ghIssueUrl: null },
    include: { author: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`Found ${proposed.length} unsynced PROPOSED suggestions.`);
  if (proposed.length === 0) return;

  for (const s of proposed) {
    const title = `[suggestion] ${s.title}`;
    const body = [
      s.body,
      '',
      '---',
      `**From:** ${s.author.name ?? s.author.email}`,
      `**Category:** ${s.category ?? '(none)'}`,
      `**Created:** ${s.createdAt.toISOString()}`,
      `**Suggestion ID:** ${s.id}`,
      `**Upvotes at sync:** ${s.upvotes}`,
    ].join('\n');

    if (dryRun) {
      console.log(`\n[DRY] Would create issue:\n  title: ${title}\n  body length: ${body.length}`);
      continue;
    }

    const cmd = `gh issue create --title ${shellEscape(title)} --body ${shellEscape(body)} --label from-planner-app`;
    let url: string;
    try {
      url = execSync(cmd, { encoding: 'utf-8' }).trim();
    } catch (err) {
      console.error(`Failed to create issue for ${s.id}:`, err);
      continue;
    }
    console.log(`Created ${url} for "${s.title}"`);

    await prisma.suggestion.update({
      where: { id: s.id },
      data: { ghIssueUrl: url, status: SuggestionStatus.TRIAGED },
    });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 14.2: Verify dry-run output**

```bash
cd ~/Downloads/atozfamily-planner && npx tsx scripts/sync-suggestions.ts --dry-run
```
Expected: "Found N unsynced PROPOSED suggestions" then `[DRY] Would create issue:` lines for each. No network call to GitHub.

- [ ] **Step 14.3: Verify real run (only run if you're ready to file actual issues)**

Prerequisite: `gh auth status` shows authenticated. The repo is `bddupre92/atozfamily-planner-` per recent commits.

```bash
cd ~/Downloads/atozfamily-planner && npx tsx scripts/sync-suggestions.ts
```
Expected: prints created issue URLs; suggestions in the app now show "issue" link next to the row.

Skip this step if you'd rather verify via dry-run only and run the real sync later.

- [ ] **Step 14.4: Commit**

```bash
git add scripts/sync-suggestions.ts
git commit -m "feat(scripts): sync-suggestions.ts — gh-CLI bridge from app to GitHub issues"
```

---

## Task 15: Update `docs/PHASES.md`

**Files:**
- Modify: `docs/PHASES.md`

- [ ] **Step 15.1: Add a Phase 3a "SHIPPED" subsection**

Open `docs/PHASES.md`. Find the `## Phase 3 — LATER (V2 — curriculum library)` heading.

Insert a new subsection immediately below the heading:

```markdown
### Phase 3a — SHIPPED (PR 1 of curriculum library)

The "browse + capture" half:

- ✅ Schema: `CurriculumResource` extended; `CurriculumSequence` + `SequenceEntry` + `SequenceAssignment` + `WeeklyTopic` + `Suggestion` added.
- ✅ Seed: Singapore Dimensions Math (KA/KB/2A/2B), LOE Foundations (A/B/C/D), Mystery Science K-2 (~30), Outdoor Hour Challenge PNW (~35), Story of the World Vol 1 (42), Build Your Library Level 0 (~30). ~526 records total.
- ✅ Library tab — browse + filter (subject, framework, season, term, search). Detail drawer.
- ✅ Suggestions tab — form, grouped list, upvote.
- ✅ `scripts/sync-suggestions.ts` — manual `gh`-CLI bridge from PROPOSED suggestions to GitHub issues.

Spec: [`docs/superpowers/specs/2026-05-26-curriculum-library-and-suggestions-design.md`](superpowers/specs/2026-05-26-curriculum-library-and-suggestions-design.md)

PR 2 ("picker + per-child next-lesson") to follow.

---

```

- [ ] **Step 15.2: Commit**

```bash
git add docs/PHASES.md
git commit -m "docs(phases): mark Phase 3a curriculum library PR 1 shipped"
```

---

## Task 16: Migrate production database & deploy

**Files:** none (operational task)

**Critical order:** migration first, then seed, then code push. Reversing this order means Vercel deploys code that references tables/columns that don't exist yet, and every request to `/api/library` and `/api/suggestions` returns 500 until the migration is applied. The reverse migration vs. code drift only affects new endpoints — existing planner pages keep working either way — but a brief 500-spam in logs is avoidable.

- [ ] **Step 16.1: Confirm `.env` points at production**

```bash
cd ~/Downloads/atozfamily-planner && grep -E "^DATABASE_URL|^DIRECT_DATABASE_URL" .env | sed -E 's/(:)([^@:]*)@/\1***@/'
```

Expected: both lines printed with passwords masked. `host` should be your production Neon endpoint (no `-dev-branch` slug). If `.env.development.local` exists in the same dir, Next.js dev would use it but Prisma CLI does NOT — Prisma reads `.env` only. So this command shows what `prisma migrate deploy` will actually hit.

- [ ] **Step 16.2: Apply migration to production Neon**

```bash
cd ~/Downloads/atozfamily-planner && npx prisma migrate deploy
```

Expected: "All migrations have been successfully applied" with one new migration named `<timestamp>_curriculum_library_pr1`. Migration applies new columns/tables only — no data destruction.

- [ ] **Step 16.3: Run seed against production**

```bash
cd ~/Downloads/atozfamily-planner && npm run db:seed
```

Expected: existing Child/Term/PlannerState rows unchanged (upserts are no-ops on existing IDs), ~526 new curriculum records inserted. Idempotent — re-running is safe.

- [ ] **Step 16.4: Push code (triggers Vercel deploy)**

```bash
cd ~/Downloads/atozfamily-planner && git push origin main
```

Expected: GitHub push succeeds; Vercel detects the push and begins build (visible at <https://vercel.com/blair-dupres-projects/atozfamily-planner>). Build runs ~30-45s; deploy ~10s.

- [ ] **Step 16.5: Verify on the live site**

After Vercel reports the new deploy as Ready, open <https://planner.atozfamily.org/planner>. Click the "Library" tab — verify cards render and filters work. Click "Suggestions" — submit a test suggestion, verify it persists, refresh and verify it survives.

Also run a quick curl from terminal:

```bash
curl -sI "https://planner.atozfamily.org/api/library?subject=SCIENCE" | head -3
```

Expected: HTTP 200.

- [ ] **Step 16.6 (optional): Roll back path documented**

If the deploy or seed misbehaves: previous production code is at the prior commit. Revert via `git revert <commit>` + push. Migration rollback requires manually dropping the new tables/columns in Neon console (Prisma doesn't auto-generate down migrations). Realistic for this scope: forward-fix is faster than rollback.

---

## Self-review checklist

After all tasks complete, verify:

1. **Spec coverage** — every section of the design spec is implemented by a task above:
   - Schema additions (CurriculumResource ext, CurriculumSequence/Entry/Assignment, WeeklyTopic, Suggestion) — Task 1
   - Seed (~526 records) — Tasks 2-8
   - Library tab (browse + filter + detail drawer) — Tasks 9, 10, 13
   - Suggestions tab + form + grouped list + upvote — Tasks 11, 12, 13
   - `scripts/sync-suggestions.ts` with `--dry-run` — Task 14
   - `docs/PHASES.md` updated — Task 15
   - PR 2 explicitly out of scope — covered by the plan's title and the spec's PR split.

2. **Pre-existing functionality preserved** — `npm run dev` still loads the planner page; existing tabs (Week, Year, Lessons, Reflections, Progress, Audit, Notes) all render unchanged. Verify after Task 13.

3. **Auth bypass preserved** — `AUTH_BYPASS=true` continues to short-circuit through `bypassSession()` in `src/lib/auth.ts`. The new API routes call `auth()` like existing routes, so this behavior is inherited.

4. **No new test framework** — verification is via `curl`, `prisma studio`, `npx tsc --noEmit`, and manual browser checks. Plan documents each verification step.

---
