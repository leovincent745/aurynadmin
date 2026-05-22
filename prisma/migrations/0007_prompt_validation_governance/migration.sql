-- Prompt validation runs and reviewer workflow

CREATE TYPE "prompt_validation_run_status" AS ENUM ('queued', 'running', 'passed', 'failed', 'canceled');
CREATE TYPE "prompt_review_status" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "prompt_validation_runs" (
    "id" TEXT NOT NULL,
    "instruction_id" TEXT NOT NULL,
    "status" "prompt_validation_run_status" NOT NULL,
    "overall_passed" BOOLEAN NOT NULL DEFAULT false,
    "rule_results" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),

    CONSTRAINT "prompt_validation_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "prompt_validation_comments" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_validation_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "prompt_review_submissions" (
    "id" TEXT NOT NULL,
    "instruction_id" TEXT NOT NULL,
    "validation_run_id" TEXT,
    "status" "prompt_review_status" NOT NULL DEFAULT 'pending',
    "submitted_by" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitter_comment" TEXT,
    "reviewer_id" TEXT,
    "reviewer_comment" TEXT,
    "decided_at" TIMESTAMP(3),

    CONSTRAINT "prompt_review_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "prompt_validation_runs_instruction_id_created_at_idx" ON "prompt_validation_runs"("instruction_id", "created_at" DESC);
CREATE INDEX "prompt_validation_comments_run_id_created_at_idx" ON "prompt_validation_comments"("run_id", "created_at" DESC);
CREATE INDEX "prompt_review_submissions_instruction_id_submitted_at_idx" ON "prompt_review_submissions"("instruction_id", "submitted_at" DESC);

ALTER TABLE "prompt_validation_runs" ADD CONSTRAINT "prompt_validation_runs_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "admin_instructions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt_validation_runs" ADD CONSTRAINT "prompt_validation_runs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "prompt_validation_comments" ADD CONSTRAINT "prompt_validation_comments_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "prompt_validation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt_validation_comments" ADD CONSTRAINT "prompt_validation_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "prompt_review_submissions" ADD CONSTRAINT "prompt_review_submissions_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "admin_instructions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt_review_submissions" ADD CONSTRAINT "prompt_review_submissions_validation_run_id_fkey" FOREIGN KEY ("validation_run_id") REFERENCES "prompt_validation_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "prompt_review_submissions" ADD CONSTRAINT "prompt_review_submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prompt_review_submissions" ADD CONSTRAINT "prompt_review_submissions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
