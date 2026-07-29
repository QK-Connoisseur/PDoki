import type { Logger } from "pino";
import type { Env } from "../env.js";
import { createConsoleMailer } from "./console.js";
import { createSmtpMailer } from "./smtp.js";
import type { Mailer } from "./mailer.js";

export type { Mailer, MailMessage } from "./mailer.js";
export { sendSafely } from "./mailer.js";
export { createMemoryMailer } from "./memory.js";
export type { MemoryMailer } from "./memory.js";
export {
  renderPasswordResetEmail,
  renderVerificationEmail,
} from "./templates.js";

export function createMailer(env: Env, logger: Logger): Mailer {
  if (env.MAIL_TRANSPORT === "smtp") {
    return createSmtpMailer({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      from: env.MAIL_FROM,
    });
  }
  return createConsoleMailer(logger);
}
