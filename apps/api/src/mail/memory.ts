import type { Mailer, MailMessage } from "./mailer.js";

export interface MemoryMailer extends Mailer {
  sent: MailMessage[];
  lastTo(address: string): MailMessage | undefined;
  clear(): void;
}

export function createMemoryMailer(): MemoryMailer {
  const sent: MailMessage[] = [];
  return {
    sent,
    async send(message) {
      sent.push(message);
    },
    lastTo(address) {
      return [...sent].reverse().find((message) => message.to === address);
    },
    clear() {
      sent.length = 0;
    },
  };
}
