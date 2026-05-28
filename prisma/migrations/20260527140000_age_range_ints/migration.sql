-- AlterTable: add integer age-range columns (string ageRange kept for human display)
ALTER TABLE "CurriculumResource"
  ADD COLUMN "ageRangeMin" INTEGER,
  ADD COLUMN "ageRangeMax" INTEGER;

-- Backfill from existing "N-N" format strings (e.g., "4-8", "5-8", "4-6")
UPDATE "CurriculumResource"
SET "ageRangeMin" = SPLIT_PART("ageRange", '-', 1)::int,
    "ageRangeMax" = SPLIT_PART("ageRange", '-', 2)::int
WHERE "ageRange" ~ '^[0-9]+-[0-9]+$';

-- Single-value fallback (e.g., "all", "8+") leaves the integer columns NULL.
-- API queries filter only when both columns are non-null.

-- CreateIndex: support range queries from the picker (PR 2 will use these)
CREATE INDEX IF NOT EXISTS "CurriculumResource_ageRangeMin_idx" ON "CurriculumResource"("ageRangeMin");
CREATE INDEX IF NOT EXISTS "CurriculumResource_ageRangeMax_idx" ON "CurriculumResource"("ageRangeMax");
