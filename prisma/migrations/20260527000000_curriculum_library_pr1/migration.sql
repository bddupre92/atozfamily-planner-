-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PROPOSED', 'TRIAGED', 'IN_PROGRESS', 'DONE', 'WONT_DO');

-- AlterTable
ALTER TABLE "CurriculumResource" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "activities" JSONB,
ADD COLUMN     "bookList" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "fieldTripLocation" TEXT,
ADD COLUMN     "framework" TEXT,
ADD COLUMN     "season" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "weekHint" INTEGER;

-- CreateTable
CREATE TABLE "CurriculumSequence" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "ageRangeMin" INTEGER NOT NULL,
    "ageRangeMax" INTEGER NOT NULL,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceEntry" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "lessonRef" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "estimatedMinutes" INTEGER,
    "isReview" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SequenceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceAssignment" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "currentEntryId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SequenceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyTopic" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "subject" "Subject" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "notes" TEXT,
    "selectedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PROPOSED',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "ghIssueUrl" TEXT,
    "ghPrUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SequenceEntry_sequenceId_orderIndex_idx" ON "SequenceEntry"("sequenceId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SequenceEntry_sequenceId_orderIndex_key" ON "SequenceEntry"("sequenceId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SequenceAssignment_childId_sequenceId_key" ON "SequenceAssignment"("childId", "sequenceId");

-- CreateIndex
CREATE INDEX "WeeklyTopic_termId_weekNumber_idx" ON "WeeklyTopic"("termId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTopic_termId_weekNumber_subject_key" ON "WeeklyTopic"("termId", "weekNumber", "subject");

-- CreateIndex
CREATE INDEX "Suggestion_status_createdAt_idx" ON "Suggestion"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CurriculumResource_subject_season_idx" ON "CurriculumResource"("subject", "season");

-- CreateIndex
CREATE INDEX "CurriculumResource_framework_idx" ON "CurriculumResource"("framework");

-- AddForeignKey
ALTER TABLE "SequenceEntry" ADD CONSTRAINT "SequenceEntry_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "CurriculumSequence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceAssignment" ADD CONSTRAINT "SequenceAssignment_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceAssignment" ADD CONSTRAINT "SequenceAssignment_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "CurriculumSequence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyTopic" ADD CONSTRAINT "WeeklyTopic_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyTopic" ADD CONSTRAINT "WeeklyTopic_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "CurriculumResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex (added in fix commit per code-review feedback: explicit FK indexes)
CREATE INDEX IF NOT EXISTS "SequenceAssignment_sequenceId_idx" ON "SequenceAssignment"("sequenceId");
CREATE INDEX IF NOT EXISTS "WeeklyTopic_resourceId_idx" ON "WeeklyTopic"("resourceId");
