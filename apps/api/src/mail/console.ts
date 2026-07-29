import type { Logger } from "pino";
import type { Mailer } from "./mailer.js";

export function createConsoleMailer(logger: Logger): Mailer {
  return {
    async send(message) {
      logger.info(
        { to: message.to, subject: message.subject, body: message.text },
        "mail (console transport)"
      );
    },
  };
}
