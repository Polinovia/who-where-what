-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('FIRST_STORY', 'FIRST_FRIEND', 'ACCOMPLICE');

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "type" "AchievementType" NOT NULL,
    "relatedUserId" TEXT NOT NULL DEFAULT '',
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_type_relatedUserId_key" ON "UserAchievement"("userId", "type", "relatedUserId");

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
