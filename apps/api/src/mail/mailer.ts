import type { Logger } from "pino";

export type MailTemplate =
  | "email-verification"
  | "password-reset"
  | "creator-application-received";

export interface MailMessage {
  template: MailTemplate;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export const MAIL_SEND_TIMEOUT_MS = 5_000;

class MailSendTimeoutError extends Error {
  constructor() {
    super("Mail send timed out");
    this.name = "MailSendTimeoutError";
  }
}

/**
 * Builds and sends without letting preparation or transport failure fail the
 * user-facing request. The deadline bounds how long the caller waits; each
 * transport must also enforce its own I/O timeouts. Delivery is unknown when
 * the deadline wins, and workflows that require guaranteed delivery need a
 * separately designed durable outbox.
 */
export async function sendSafely(
  mailer: Mailer,
  logger: Logger,
  template: MailTemplate,
  createMessage: () => MailMessage,
  timeoutMs = MAIL_SEND_TIMEOUT_MS
): Promise<void> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    const message = createMessage();
    await Promise.race([
      mailer.send(message),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new MailSendTimeoutError()),
          timeoutMs
        );
      }),
    ]);
  } catch (error) {
    const failureKind =
      error instanceof MailSendTimeoutError
        ? "delivery-timeout"
        : "delivery-failed";
    logger.error(
      {
        template,
        failureKind,
      },
      "mail delivery was not confirmed"
    );
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
