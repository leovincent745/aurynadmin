-- Immutable audit trail and rollback metadata for prompt versions

CREATE TYPE "prompt_audit_event_type" AS ENUM (
  'version_created',
  'draft_saved',
  'published',
  'archived',
  'activated',
  'rollback',
  'validation_run',
  'review_submitted',
  'review_decided'
);

CREATE TABLE "prompt_audit_events" (
    "id" TEXT NOT NULL,
    "instruction_id" TEXT NOT NULL,
    "event_type" "prompt_audit_event_type" NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "prompt_rollback_records" (
    "id" TEXT NOT NULL,
    "source_instruction_id" TEXT NOT NULL,
    "target_draft_id" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "reason" TEXT,
    "source_version_number" INTEGER NOT NULL,
    "source_status" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_rollback_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "prompt_audit_events_instruction_id_created_at_idx" ON "prompt_audit_events"("instruction_id", "created_at" DESC);
CREATE INDEX "prompt_audit_events_event_type_created_at_idx" ON "prompt_audit_events"("event_type", "created_at" DESC);
CREATE INDEX "prompt_rollback_records_source_instruction_id_created_at_idx" ON "prompt_rollback_records"("source_instruction_id", "created_at" DESC);
CREATE INDEX "prompt_rollback_records_target_draft_id_idx" ON "prompt_rollback_records"("target_draft_id");

ALTER TABLE "prompt_audit_events" ADD CONSTRAINT "prompt_audit_events_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "admin_instructions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt_audit_events" ADD CONSTRAINT "prompt_audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "prompt_rollback_records" ADD CONSTRAINT "prompt_rollback_records_source_instruction_id_fkey" FOREIGN KEY ("source_instruction_id") REFERENCES "admin_instructions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prompt_rollback_records" ADD CONSTRAINT "prompt_rollback_records_target_draft_id_fkey" FOREIGN KEY ("target_draft_id") REFERENCES "admin_instructions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prompt_rollback_records" ADD CONSTRAINT "prompt_rollback_records_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
