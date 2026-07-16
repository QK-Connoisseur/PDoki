import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import type { PrismaClient } from "@pumdoki/database";

let databasePromise: Promise<PrismaClient> | undefined;

export function loadTestDatabase(): Promise<PrismaClient> {
  if (!process.env.DATABASE_URL) {
    const rootEnv = fileURLToPath(new URL("../../../../.env", import.meta.url));
    if (existsSync(rootEnv)) loadEnvFile(rootEnv);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for DB-backed API tests. Start Postgres and provide the root .env."
    );
  }
  databasePromise ??= import("@pumdoki/database").then(({ prisma }) => prisma);
  return databasePromise;
}
