import type { MailMessage } from "./mailer.js";

export interface TemplateInput {
  to: string;
  displayName: string;
  url: string;
}

export interface CreatorApplicationReceivedInput {
  to: string;
  statusUrl: string;
}

const SUPPORT_ADDRESS = "support@pumdoki.example";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function normalizeDisplayName(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function layout(
  heading: string,
  body: string,
  url: string,
  cta: string
): string {
  const safeUrl = escapeHtml(url);
  return [
    `<h1>${escapeHtml(heading)}</h1>`,
    `<p>${escapeHtml(body)}</p>`,
    `<p><a href="${safeUrl}">${escapeHtml(cta)}</a></p>`,
    `<p>If the link does not work, paste this into your browser:<br>${safeUrl}</p>`,
  ].join("\n");
}

export function renderVerificationEmail(input: TemplateInput): MailMessage {
  const body = `Confirm this address to finish setting up your Pumdoki account. This link expires in 24 hours.`;
  const displayName = normalizeDisplayName(input.displayName);
  return {
    template: "email-verification",
    to: input.to,
    subject: "Verify your Pumdoki email address",
    text: [
      `Hi ${displayName},`,
      "",
      body,
      "",
      input.url,
      "",
      `If you did not create a Pumdoki account, contact ${SUPPORT_ADDRESS} or ignore this message.`,
    ].join("\n"),
    html: layout(
      `Hi ${displayName},`,
      body,
      input.url,
      "Verify my email address"
    ),
  };
}

export function renderPasswordResetEmail(input: TemplateInput): MailMessage {
  const body = `Use the link below to choose a new Pumdoki password. It expires in 1 hour and can be used once. Choosing a new password signs you out on every device.`;
  const displayName = normalizeDisplayName(input.displayName);
  return {
    template: "password-reset",
    to: input.to,
    subject: "Reset your Pumdoki password",
    text: [
      `Hi ${displayName},`,
      "",
      body,
      "",
      input.url,
      "",
      `If you did not request this, no change has been made to your account. Contact ${SUPPORT_ADDRESS} with questions.`,
    ].join("\n"),
    html: layout(
      `Hi ${displayName},`,
      body,
      input.url,
      "Choose a new password"
    ),
  };
}

export function renderCreatorApplicationReceivedEmail(
  input: CreatorApplicationReceivedInput
): MailMessage {
  const body =
    "We received your Pumdoki creator application. Its current status is Pending. This receipt is not an approval, and your account access has not changed. Identity verification has not started. No action is required right now. Do not send identity documents, tax information, banking details, or other sensitive files by email or support message.";
  return {
    template: "creator-application-received",
    to: input.to,
    subject: "We received your application",
    text: [
      "Hello,",
      "",
      body,
      "",
      "Sign in to Pumdoki to view the current application status:",
      input.statusUrl,
    ].join("\n"),
    html: layout("Hello,", body, input.statusUrl, "Check application status"),
  };
}
