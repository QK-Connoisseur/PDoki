import type { MailMessage } from "./mailer.js";

export interface TemplateInput {
  to: string;
  displayName: string;
  url: string;
}

const SUPPORT_ADDRESS = "support@pumdoki.example";

function layout(
  heading: string,
  body: string,
  url: string,
  cta: string
): string {
  return [
    `<h1>${heading}</h1>`,
    `<p>${body}</p>`,
    `<p><a href="${url}">${cta}</a></p>`,
    `<p>If the link does not work, paste this into your browser:<br>${url}</p>`,
  ].join("\n");
}

export function renderVerificationEmail(input: TemplateInput): MailMessage {
  const body = `Confirm this address to finish setting up your Pumdoki account. This link expires in 24 hours.`;
  return {
    to: input.to,
    subject: "Verify your Pumdoki email address",
    text: [
      `Hi ${input.displayName},`,
      "",
      body,
      "",
      input.url,
      "",
      `If you did not create a Pumdoki account, contact ${SUPPORT_ADDRESS} or ignore this message.`,
    ].join("\n"),
    html: layout(
      `Hi ${input.displayName},`,
      body,
      input.url,
      "Verify my email address"
    ),
  };
}

export function renderPasswordResetEmail(input: TemplateInput): MailMessage {
  const body = `Use the link below to choose a new Pumdoki password. It expires in 1 hour and can be used once. Choosing a new password signs you out on every device.`;
  return {
    to: input.to,
    subject: "Reset your Pumdoki password",
    text: [
      `Hi ${input.displayName},`,
      "",
      body,
      "",
      input.url,
      "",
      `If you did not request this, no change has been made to your account. Contact ${SUPPORT_ADDRESS} with questions.`,
    ].join("\n"),
    html: layout(
      `Hi ${input.displayName},`,
      body,
      input.url,
      "Choose a new password"
    ),
  };
}
