import type { Session, User } from "@pumdoki/database";
import type { OperationsPrincipal } from "../operations/access.js";

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
      operationsAuth?: {
        principal: OperationsPrincipal;
        user: User;
      };
    }
  }
}

export {};
