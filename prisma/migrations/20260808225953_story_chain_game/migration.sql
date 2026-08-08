-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_roundId_fkey";

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_lobbyId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_roundId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_whatAnswerId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_whereAnswerId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_whoAnswerId_fkey";

-- DropIndex
DROP INDEX "Answer_roundId_playerId_type_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "roundId",
DROP COLUMN "type",
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "questionId" TEXT NOT NULL,
ADD COLUMN     "storyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lobby" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL DEFAULT 8;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "seat" INTEGER;

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "roundId",
DROP COLUMN "whatAnswerId",
DROP COLUMN "whereAnswerId",
DROP COLUMN "whoAnswerId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lobbyId" TEXT NOT NULL,
ADD COLUMN     "starterPlayerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Round";

-- DropEnum
DROP TYPE "AnswerType";

-- DropEnum
DROP TYPE "RoundStatus";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Question_categoryId_order_key" ON "Question"("categoryId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_storyId_order_key" ON "Answer"("storyId", "order");

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_starterPlayerId_fkey" FOREIGN KEY ("starterPlayerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

