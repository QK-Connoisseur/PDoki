import type { Logger } from "pino";
import type { Mailer } from "./mailer.js";

export function createConsoleMailer(logger: Logger): Mailer {
  return {
    async send(message) {
      logger.warn(
        { template: message.template },
        "mail discarded by non-delivery console transport"
      );
    },
  };
}
