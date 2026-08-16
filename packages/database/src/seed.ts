import { randomBytes, scryptSync } from "node:crypto";
import { prisma } from "./client.js";

// Dev-only password hashing so seeds never store plaintext. Phase 3 replaces
// this with the real auth-service hashing (argon2id) — do not reuse elsewhere.
function devHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

const seedUsers = [
  {
    email: "admin@pumdoki.example",
    displayName: "Pumdoki Admin",
    role: "ADMIN",
    preverified: false,
  },
  {
    email: "moderator@pumdoki.example",
    displayName: "Pumdoki Moderator",
    role: "MODERATOR",
    preverified: false,
  },
  {
    email: "creator@pumdoki.example",
    displayName: "Sample Creator",
    role: "CREATOR",
    preverified: true,
  },
  {
    email: "member@pumdoki.example",
    displayName: "Sample Member",
    role: "MEMBER",
    preverified: false,
  },
] as const;

async function main(): Promise<void> {
  for (const user of seedUsers) {
    const seededUser = await prisma.user.upsert({
      where: { email: user.email },
      update: { displayName: user.displayName, role: user.role },
      create: {
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        passwordHash: devHash("pumdoki-dev-password"),
      },
    });
    if (user.preverified && seededUser.emailVerifiedAt === null) {
      await prisma.user.update({
        where: { id: seededUser.id },
        data: { emailVerifiedAt: new Date() },
      });
    }
    await prisma.userPreference.upsert({
      where: { userId: seededUser.id },
      update: {},
      create: { userId: seededUser.id },
    });
  }
  const count = await prisma.user.count();
  console.log(`Seed complete. Users in database: ${count}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
