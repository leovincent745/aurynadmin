-- AlterTable
ALTER TABLE "conversations" ADD COLUMN "is_admin_test" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "conversations_is_admin_test_idx" ON "conversations"("is_admin_test");
