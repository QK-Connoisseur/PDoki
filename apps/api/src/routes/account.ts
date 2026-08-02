import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  SessionIdParams,
  UpdateProfileRequest,
} from "@pumdoki/contracts";
import {
  ChangeEmailRequestSchema,
  ChangePasswordRequestSchema,
  SessionIdParamsSchema,
  UpdateProfileRequestSchema,
} from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { Router, type Request } from "express";
import type { Logger } from "pino";
import { AttemptLimiter } from "../auth/attemptLimiter.js";
import { createAuthService } from "../auth/service.js";
import { clearSessionCookie } from "../auth/session.js";
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";
import type { Mailer } from "../mail/index.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

interface AccountRouterDeps {
  db: PrismaClient;
  env: Env;
  mailer: Mailer;
  logger: Logger;
}

function requestMetadata(req: Request) {
  return {
    ipAddress: req.ip ?? req.socket.remoteAddress ?? "unknown",
    userAgent: req.get("user-agent")?.slice(0, 512),
  };
}

function isCurrentPasswordFailure(error: unknown): boolean {
  return (
    error instanceof HttpError &&
    error.code === "BAD_REQUEST" &&
    typeof error.details === "object" &&
    error.details !== null &&
    "field" in error.details &&
    error.details.field === "currentPassword"
  );
}

export function accountRouter({
  db,
  env,
  mailer,
  logger,
}: AccountRouterDeps): Router {
  const router = Router();
  const authenticate = requireAuth(db, env);
  const service = createAuthService(db, { env, mailer, logger });
  // Five incorrect current-password confirmations per account and IP per hour.
  const passwordAttempts = new AttemptLimiter(5, 60 * 60 * 1000);

  router.patch(
    "/me/profile",
    authenticate,
    validate({ body: UpdateProfileRequestSchema }),
    async (req, res) => {
      const user = await service.updateProfile(
        req.auth!.user.id,
        req.validated?.body as UpdateProfileRequest
      );
      res.json({ user });
    }
  );

  router.patch(
    "/me/email",
    authenticate,
    validate({ body: ChangeEmailRequestSchema }),
    async (req, res) => {
      const metadata = requestMetadata(req);
      const key = `email:${metadata.ipAddress}:${req.auth!.user.id}`;
      if (passwordAttempts.isBlocked(key)) {
        throw new HttpError(
          429,
          "RATE_LIMITED",
          "Too many failed password confirmations, please try again later"
        );
      }
      try {
        const user = await service.changeEmail(
          req.auth!.user.id,
          req.auth!.session.id,
          req.validated?.body as ChangeEmailRequest,
          metadata
        );
        passwordAttempts.reset(key);
        res.json({ user });
      } catch (error) {
        if (isCurrentPasswordFailure(error)) {
          passwordAttempts.recordFailure(key);
        }
        throw error;
      }
    }
  );

  router.patch(
    "/me/password",
    authenticate,
    validate({ body: ChangePasswordRequestSchema }),
    async (req, res) => {
      const metadata = requestMetadata(req);
      const key = `password:${metadata.ipAddress}:${req.auth!.user.id}`;
      if (passwordAttempts.isBlocked(key)) {
        throw new HttpError(
          429,
          "RATE_LIMITED",
          "Too many failed password confirmations, please try again later"
        );
      }
      try {
        await service.changePassword(
          req.auth!.user.id,
          req.auth!.session.id,
          req.validated?.body as ChangePasswordRequest
        );
        passwordAttempts.reset(key);
        res.json({ status: "changed" });
      } catch (error) {
        if (isCurrentPasswordFailure(error)) {
          passwordAttempts.recordFailure(key);
        }
        throw error;
      }
    }
  );

  router.get("/me/sessions", authenticate, async (req, res) => {
    const sessions = await service.listActiveSessions(
      req.auth!.user.id,
      req.auth!.session.id
    );
    res.json({ sessions });
  });

  router.delete(
    "/me/sessions/:sessionId",
    authenticate,
    validate({ params: SessionIdParamsSchema }),
    async (req, res) => {
      const { sessionId } = req.validated?.params as SessionIdParams;
      await service.revokeSession(req.auth!.user.id, sessionId);
      if (sessionId === req.auth!.session.id) clearSessionCookie(res, env);
      res.status(204).end();
    }
  );

  return router;
}
