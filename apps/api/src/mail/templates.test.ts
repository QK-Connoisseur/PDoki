import { describe, expect, it } from "vitest";
import {
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

  it("never claims encryption or moderation guarantees", () => {
    const bodies = [
      renderVerificationEmail(input),
      renderPasswordResetEmail(input),
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
