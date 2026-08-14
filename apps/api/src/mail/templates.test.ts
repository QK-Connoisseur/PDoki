import { describe, expect, it } from "vitest";
import {
  renderCreatorApplicationReceivedEmail,
  renderPasswordResetEmail,
  renderVerificationEmail,
} from "./templates.js";

describe("mail templates", () => {
  const input = {
    to: "alice@example.com",
    displayName: "Alice",
    url: "http://localhost:5173/verify-email?token=abc123",
  };

  it("renders a verification email addressed to the recipient", () => {
    const message = renderVerificationEmail(input);
    expect(message.to).toBe("alice@example.com");
    expect(message.subject).toBe("Verify your Pumdoki email address");
    expect(message.text).toContain(input.url);
    expect(message.html).toContain(input.url);
    expect(message.text).toContain("Alice");
  });

  it("states the reset link lifetime", () => {
    const message = renderPasswordResetEmail({
      ...input,
      url: "http://localhost:5173/reset-password?token=abc123",
    });
    expect(message.subject).toBe("Reset your Pumdoki password");
    expect(message.text).toContain("1 hour");
  });

  it("describes a creator application receipt without promising approval or timing", () => {
    const message = renderCreatorApplicationReceivedEmail({
      to: input.to,
      statusUrl: "http://localhost:5173/creator/onboarding",
    });
    expect(message.subject).toBe("We received your application");
    expect(message.text.toLowerCase()).toContain("status is pending");
    expect(message.text.toLowerCase()).toContain("receipt is not an approval");
    expect(message.text.toLowerCase()).toContain(
      "identity verification has not started"
    );
    expect(message.text.toLowerCase()).toContain(
      "account access has not changed"
    );
    expect(message.text.toLowerCase()).toContain(
      "do not send identity documents"
    );
    expect(message.text).toContain("/creator/onboarding");
    expect(message.text.toLowerCase()).not.toContain("business days");
  });

  it("normalizes plain-text names and escapes action-template HTML", () => {
    const unsafe = {
      to: "alice@example.com",
      displayName:
        'Alice\r\nInjected\u0000 <img src=x onerror="alert(1)"> & Friends',
      url: 'https://example.com/path?token=<script>&next="unsafe"',
    };
    const messages = [
      renderVerificationEmail(unsafe),
      renderPasswordResetEmail(unsafe),
    ];

    for (const message of messages) {
      expect(message.html).not.toContain("<img");
      expect(message.html).not.toContain("<script>");
      expect(message.html).toContain("&lt;img");
      expect(message.html).toContain("&lt;script&gt;");
      expect(message.html).toContain("&amp;");
      expect(message.html).toContain("&quot;");
      expect(message.text).not.toContain("\r");
      expect(message.text).not.toContain("\u0000");
      expect(message.text).not.toContain("\nInjected");
      expect(message.text).toContain("Alice Injected");
    }
  });

  it("escapes the receipt status URL in HTML", () => {
    const message = renderCreatorApplicationReceivedEmail({
      to: "alice@example.com",
      statusUrl: 'https://example.com/path?next=<script>&view="unsafe"',
    });
    expect(message.html).not.toContain("<script>");
    expect(message.html).toContain("&lt;script&gt;");
    expect(message.html).toContain("&amp;");
    expect(message.html).toContain("&quot;");
  });

  it("never claims encryption or moderation guarantees", () => {
    const bodies = [
      renderVerificationEmail(input),
      renderPasswordResetEmail(input),
      renderCreatorApplicationReceivedEmail({
        to: input.to,
        statusUrl: "http://localhost:5173/creator/onboarding",
      }),
    ].flatMap((message) => [message.text, message.html]);
    for (const body of bodies) {
      expect(body.toLowerCase()).not.toContain("encrypt");
      expect(body.toLowerCase()).not.toContain("moderat");
    }
  });

  it("uses only reserved example contact addresses", () => {
    const message = renderVerificationEmail(input);
    const contacts = message.text.match(/[\w.+-]+@[\w.-]+/g) ?? [];
    for (const contact of contacts) {
      expect(
        contact.endsWith("@example.com") || contact.endsWith("pumdoki.example")
      ).toBe(true);
    }
  });
});
