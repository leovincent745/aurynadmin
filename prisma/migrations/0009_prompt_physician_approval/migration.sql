CREATE TABLE "prompt_physician_approvals" (
    "id" TEXT NOT NULL,
    "instruction_id" TEXT NOT NULL,
    "status" "prompt_review_status" NOT NULL,
    "physician_id" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "prompt_physician_approvals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "prompt_physician_approvals_instruction_id_created_at_idx" ON "prompt_physician_approvals"("instruction_id", "created_at" DESC);

ALTER TABLE "prompt_physician_approvals" ADD CONSTRAINT "prompt_physician_approvals_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "admin_instructions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt_physician_approvals" ADD CONSTRAINT "prompt_physician_approvals_physician_id_fkey" FOREIGN KEY ("physician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
