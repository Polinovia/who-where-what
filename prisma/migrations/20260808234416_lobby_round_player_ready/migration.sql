-- AlterTable
ALTER TABLE "Lobby" ADD COLUMN     "currentRound" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "ready" BOOLEAN NOT NULL DEFAULT false;
