-- Prompt System RBAC: reviewer, physician, developer, viewer (read-only)
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'reviewer';
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'physician';
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'developer';
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'viewer';
