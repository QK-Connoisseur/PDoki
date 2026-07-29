import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { PrismaClient, UserRole } from "@pumdoki/database";
import {
  hashSessionToken,
  readSessionToken,
  SESSION_DURATION_MS,
  SESSION_RENEWAL_INTERVAL_MS,
  setSessionCookie,
} from "../auth/session.js";
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";

export function requireAuth(db: PrismaClient, env?: Env): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = readSessionToken(req);
      if (!token) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication required");
      }
      const now = new Date();
      const session = await db.session.findUnique({
        where: { tokenHash: hashSessionToken(token) },
        include: { user: true },
      });
      if (
        !session ||
        session.revokedAt !== null ||
        session.expiresAt.getTime() <= now.getTime()
      ) {
        throw new HttpError(401, "UNAUTHORIZED", "Authentication required");
      }
      if (session.user.status !== "ACTIVE") {
        throw new HttpError(403, "FORBIDDEN", "Account access is restricted");
      }

      let attachedSession = session;
      const renewalCutoff = new Date(
        now.getTime() - SESSION_RENEWAL_INTERVAL_MS
      );
      if (session.lastExtendedAt.getTime() <= renewalCutoff.getTime()) {
        const newExpiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
        const extended = await db.session.updateMany({
          where: {
            id: session.id,
            revokedAt: null,
            expiresAt: { gt: now },
            lastExtendedAt: { lte: renewalCutoff },
          },
          data: { expiresAt: newExpiresAt, lastExtendedAt: now },
        });
        if (extended.count === 1) {
          attachedSession = {
            ...session,
            expiresAt: newExpiresAt,
            lastExtendedAt: now,
          };
          if (env) setSessionCookie(res, env, token);
        }
      }

      Object.defineProperty(req, "auth", {
        value: { user: session.user, session: attachedSession },
        configurable: true,
        enumerable: true,
        writable: true,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new HttpError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }
    if (!roles.includes(req.auth.user.role)) {
      next(new HttpError(403, "FORBIDDEN", "Insufficient permissions"));
      return;
    }
    next();
  };
}

/**
 * Soft verification gate. Applied to money and creator endpoints from
 * Phase 5 onward; browsing and login stay open to unverified accounts.
 */
export function requireVerifiedEmail(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new HttpError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }
    if (req.auth.user.emailVerifiedAt === null) {
      next(
        new HttpError(
          403,
          "EMAIL_UNVERIFIED",
          "Verify your email address to continue"
        )
      );
      return;
    }
    next();
  };
}
