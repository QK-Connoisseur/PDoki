import type { Session, User } from "@pumdoki/database";
import type {
  OperationsPermission,
  VerifiedOperationsIdentity,
} from "../operations/types.js";

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
        identity: VerifiedOperationsIdentity;
        operator: {
          id: string;
          userId: string;
          permissions: readonly OperationsPermission[];
        };
        user: User;
      };
    }
  }
}

export {};
