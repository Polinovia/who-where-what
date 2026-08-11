-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AchievementType" ADD VALUE 'GENEROUS';
ALTER TYPE "AchievementType" ADD VALUE 'VETERAN';
ALTER TYPE "AchievementType" ADD VALUE 'NOVELIST';
ALTER TYPE "AchievementType" ADD VALUE 'FAN_FAVORITE';
ALTER TYPE "AchievementType" ADD VALUE 'POPULAR';
ALTER TYPE "AchievementType" ADD VALUE 'PARTY_PLANNER';
ALTER TYPE "AchievementType" ADD VALUE 'EXPLORER';
ALTER TYPE "AchievementType" ADD VALUE 'FULL_HOUSE';
