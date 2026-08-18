import type { Logger } from "pino";
import { describe, expect, it } from "vitest";
import { loadEnv } from "../env.js";
import { createMailer } from "./index.js";

const databaseUrl = "postgresql://pumdoki:pumdoki@localhost:5432/pumdoki_test";
const logger = {} as Logger;

describe("createMailer", () => {
  it("allows the local Mailpit SMTP transport outside production", () => {
    const env = loadEnv({
      DATABASE_URL: databaseUrl,
      NODE_ENV: "development",
      MAIL_TRANSPORT: "smtp",
      SMTP_HOST: "127.0.0.1",
    } as NodeJS.ProcessEnv);

    expect(() => createMailer(env, logger)).not.toThrow();
  });

  it("rejects plaintext SMTP to a non-local host", () => {
    const env = loadEnv({
      DATABASE_URL: databaseUrl,
      NODE_ENV: "development",
      MAIL_TRANSPORT: "smtp",
      SMTP_HOST: "smtp.example.com",
    } as NodeJS.ProcessEnv);

    expect(() => createMailer(env, logger)).toThrow(
      "Plaintext SMTP is limited to local Mailpit"
    );
  });

  it("fails closed in production until a secure provider exists", () => {
    const env = loadEnv({
      DATABASE_URL: databaseUrl,
      NODE_ENV: "production",
      MAIL_TRANSPORT: "smtp",
      SMTP_HOST: "localhost",
    } as NodeJS.ProcessEnv);

    expect(() => createMailer(env, logger)).toThrow(
      "Production mail delivery is disabled"
    );
  });
});
