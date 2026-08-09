-- AlterTable
ALTER TABLE "Lobby" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'fr';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'fr';

-- DropIndex
DROP INDEX "Question_categoryId_order_key";

-- CreateIndex
CREATE UNIQUE INDEX "Question_categoryId_language_order_key" ON "Question"("categoryId", "language", "order");
