import nodemailer from "nodemailer";
import type { Mailer } from "./mailer.js";

const SMTP_CONNECTION_TIMEOUT_MS = 4_000;
const SMTP_GREETING_TIMEOUT_MS = 4_000;
const SMTP_SOCKET_TIMEOUT_MS = 5_000;
const LOCAL_SMTP_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export interface SmtpOptions {
  host: string;
  port: number;
  from: string;
}

export function createSmtpMailer(options: SmtpOptions): Mailer {
  if (!LOCAL_SMTP_HOSTS.has(options.host.toLowerCase())) {
    throw new Error("Plaintext SMTP is limited to local Mailpit");
  }
  const transport = nodemailer.createTransport({
    host: options.host,
    port: options.port,
    secure: false,
    ignoreTLS: true,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
  });
  return {
    async send(message) {
      await transport.sendMail({
        from: options.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    },
  };
}
