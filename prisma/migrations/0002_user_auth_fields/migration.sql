-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin', 'super_admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT,
ADD COLUMN "role" "user_role" NOT NULL DEFAULT 'user';

-- Existing rows (if any) need a placeholder hash until re-seeded; seed script replaces admin user.
UPDATE "users" SET "password_hash" = '' WHERE "password_hash" IS NULL;

ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
