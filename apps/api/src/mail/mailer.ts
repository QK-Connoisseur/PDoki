import type { Logger } from "pino";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

/**
 * Sends without letting a transport failure fail the user-facing request.
 * Delivery is best-effort: the user can always request a new link.
 */
export async function sendSafely(
  mailer: Mailer,
  logger: Logger,
  message: MailMessage
): Promise<void> {
  try {
    await mailer.send(message);
  } catch (error) {
    logger.error({ err: error, subject: message.subject }, "mail send failed");
  }
}
