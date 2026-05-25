import { PrismaClient, UserRole } from "@prisma/client";

import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "auryn@gmail.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "1234567890";
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: UserRole.super_admin,
    },
    update: {
      passwordHash,
      role: UserRole.super_admin,
    },
  });

  console.info(`Seeded admin user: ${user.email} (${user.role})`);

  const demoEmail = "demo.user@auryn.com";
  const demoPasswordHash = await hashPassword("DemoUser123!");
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    create: {
      email: demoEmail,
      passwordHash: demoPasswordHash,
      role: UserRole.user,
    },
    update: {
      role: UserRole.user,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: demoUser.id },
    create: {
      userId: demoUser.id,
      displayName: "Demo User",
      wellnessGoal: "Support GLP-1 journey with nutrition and movement",
      physicianPractice: "Dr. Rivera — Metabolic Health Clinic",
      activeProtocol: "GLP-1 support pathway",
      allergiesRestrictions: "Shellfish",
      preferences: "Morning check-ins, metric units",
      memorySummary: "Prefers concise, encouraging tone.",
    },
    update: {
      displayName: "Demo User",
      wellnessGoal: "Support GLP-1 journey with nutrition and movement",
      physicianPractice: "Dr. Rivera — Metabolic Health Clinic",
      activeProtocol: "GLP-1 support pathway",
      allergiesRestrictions: "Shellfish",
      preferences: "Morning check-ins, metric units",
      memorySummary: "Prefers concise, encouraging tone.",
    },
  });

  console.info(`Seeded demo end-user: ${demoUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
