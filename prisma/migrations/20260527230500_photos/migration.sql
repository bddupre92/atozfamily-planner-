-- CreateTable: Photo (attached to a Lesson)
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Photo_lessonId_idx" ON "Photo"("lessonId");

ALTER TABLE "Photo" ADD CONSTRAINT "Photo_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
