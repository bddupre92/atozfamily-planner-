-- AlterTable: add optional iCal feed token to User
ALTER TABLE "User" ADD COLUMN "icalToken" TEXT;

-- Unique constraint so each token is only ever pointed at one user
CREATE UNIQUE INDEX "User_icalToken_key" ON "User"("icalToken");
