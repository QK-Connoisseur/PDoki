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
  { email: "admin@pumdoki.example", displayName: "Pumdoki Admin", role: "ADMIN" },
  { email: "moderator@pumdoki.example", displayName: "Pumdoki Moderator", role: "MODERATOR" },
  { email: "creator@pumdoki.example", displayName: "Sample Creator", role: "CREATOR" },
  { email: "member@pumdoki.example", displayName: "Sample Member", role: "MEMBER" },
] as const;

async function main(): Promise<void> {
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { displayName: user.displayName, role: user.role },
      create: { ...user, passwordHash: devHash("pumdoki-dev-password") },
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
