-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "playerCode" TEXT;

-- Backfill existing rows with a random 8-char code before enforcing NOT NULL.
UPDATE "User" SET "playerCode" = upper(substr(md5(random()::text || id), 1, 8)) WHERE "playerCode" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "playerCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_playerCode_key" ON "User"("playerCode");
