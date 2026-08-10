-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "placeholders" TEXT[] DEFAULT ARRAY[]::TEXT[];
