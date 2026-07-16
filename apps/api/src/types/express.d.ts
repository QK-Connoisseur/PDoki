import type { Session, User } from "@pumdoki/database";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
      auth?: {
        user: User;
        session: Session;
      };
    }
  }
}

export {};
