import type { Logger } from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createConsoleMailer } from "./console.js";
import { sendSafely, type Mailer, type MailMessage } from "./mailer.js";

const message: MailMessage = {
  template: "creator-application-received",
  to: "private-recipient@example.com",
  subject: "Private subject",
  text: "Private body with token-value",
  html: "<p>Private body with token-value</p>",
};

function testLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("sendSafely", () => {
  it("contains message-preparation failures without leaking their text", async () => {
    const mailer: Mailer = { send: vi.fn() };
    const logger = testLogger();

    await sendSafely(mailer, logger, "creator-application-received", () => {
      throw new Error("private-recipient@example.com token-value");
    });

    expect(mailer.send).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      {
        template: "creator-application-received",
        failureKind: "delivery-failed",
      },
      "mail delivery was not confirmed"
    );
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain(
      "private-recipient"
    );
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain(
      "token-value"
    );
  });

  it("contains transport failures without logging raw provider details", async () => {
    const mailer: Mailer = {
      async send() {
        const error = new Error(
          "provider rejected private-recipient@example.com"
        );
        error.name = "private-recipient@example.com";
        throw error;
      },
    };
    const logger = testLogger();

    await sendSafely(
      mailer,
      logger,
      "creator-application-received",
      () => message
    );

    expect(logger.error).toHaveBeenCalledWith(
      {
        template: "creator-application-received",
        failureKind: "delivery-failed",
      },
      "mail delivery was not confirmed"
    );
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain(
      "provider rejected"
    );
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain(
      "private-recipient"
    );
  });

  it("bounds caller waiting for a stalled transport", async () => {
    vi.useFakeTimers();
    const mailer: Mailer = { send: () => new Promise<void>(() => undefined) };
    const logger = testLogger();

    const completion = sendSafely(
      mailer,
      logger,
      "creator-application-received",
      () => message,
      25
    );
    await vi.advanceTimersByTimeAsync(25);
    await completion;

    expect(logger.error).toHaveBeenCalledWith(
      {
        template: "creator-application-received",
        failureKind: "delivery-timeout",
      },
      "mail delivery was not confirmed"
    );
  });
});

describe("console mailer", () => {
  it("logs only the static template identifier", async () => {
    const logger = testLogger();

    await createConsoleMailer(logger).send(message);

    expect(logger.warn).toHaveBeenCalledWith(
      { template: "creator-application-received" },
      "mail discarded by non-delivery console transport"
    );
    const logged = JSON.stringify(vi.mocked(logger.warn).mock.calls);
    expect(logged).not.toContain(message.to);
    expect(logged).not.toContain(message.subject);
    expect(logged).not.toContain("token-value");
  });
});
