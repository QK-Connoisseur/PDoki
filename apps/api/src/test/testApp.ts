import { pino } from "pino";
import type { Express } from "express";
import type { PrismaClient } from "@pumdoki/database";
import { createApp } from "../app.js";
import { loadEnv } from "../env.js";
import { createMemoryMailer } from "../mail/index.js";
import type { Mailer } from "../mail/index.js";

export function testApp(
  overrides: {
    checkDatabase?: () => Promise<boolean>;
    env?: Partial<Record<string, string>>;
    db?: PrismaClient;
    mailer?: Mailer;
  } = {}
): Express {
  const env = loadEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/pumdoki_test",
    ...overrides.env,
  } as NodeJS.ProcessEnv);
  return createApp({
    env,
    logger: pino({ level: "silent" }),
    checkDatabase: overrides.checkDatabase ?? (async () => true),
    version: "test",
    db: overrides.db ?? ({} as PrismaClient),
    mailer: overrides.mailer ?? createMemoryMailer(),
  });
}
