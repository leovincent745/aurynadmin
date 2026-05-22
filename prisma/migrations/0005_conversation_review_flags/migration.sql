-- AlterTable
ALTER TABLE "conversations" ADD COLUMN "flagged_for_review" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "flagged_at" TIMESTAMP(3),
ADD COLUMN "flagged_by" TEXT,
ADD COLUMN "flagged_note" TEXT;

-- CreateIndex
CREATE INDEX "conversations_updated_at_idx" ON "conversations"("updated_at" DESC);

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_flagged_by_fkey" FOREIGN KEY ("flagged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
