import nodemailer from "nodemailer";
import type { Mailer } from "./mailer.js";

export interface SmtpOptions {
  host: string;
  port: number;
  from: string;
}

export function createSmtpMailer(options: SmtpOptions): Mailer {
  const transport = nodemailer.createTransport({
    host: options.host,
    port: options.port,
    secure: false,
    ignoreTLS: true,
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
