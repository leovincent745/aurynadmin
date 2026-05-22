-- CreateIndex
CREATE INDEX "admin_instructions_status_published_at_idx" ON "admin_instructions"("status", "published_at" DESC);
