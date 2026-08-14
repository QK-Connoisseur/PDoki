import type { Logger } from "pino";
import type { Env } from "../env.js";
import { createConsoleMailer } from "./console.js";
import { createSmtpMailer } from "./smtp.js";
import type { Mailer } from "./mailer.js";

export type { Mailer, MailMessage, MailTemplate } from "./mailer.js";
export { MAIL_SEND_TIMEOUT_MS, sendSafely } from "./mailer.js";
export { createMemoryMailer } from "./memory.js";
export type { MemoryMailer } from "./memory.js";
export {
  renderCreatorApplicationReceivedEmail,
  renderPasswordResetEmail,
  renderVerificationEmail,
} from "./templates.js";

export function createMailer(env: Env, logger: Logger): Mailer {
  if (env.NODE_ENV === "production") {
    throw new Error(
      "Production mail delivery is disabled until an authenticated TLS provider is configured"
    );
  }
  if (env.MAIL_TRANSPORT === "smtp") {
    return createSmtpMailer({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      from: env.MAIL_FROM,
    });
  }
  return createConsoleMailer(logger);
}
