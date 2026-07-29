import type {
  LoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RegisterRequest,
  VerifyEmailConfirmRequest,
} from "@pumdoki/contracts";
import {
  LoginRequestSchema,
  PasswordResetConfirmSchema,
  PasswordResetRequestSchema,
  RegisterRequestSchema,
  VerifyEmailConfirmSchema,
} from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { Router, type Request } from "express";
import type { Logger } from "pino";
import { AttemptLimiter } from "../auth/attemptLimiter.js";
import { LoginAttemptTracker } from "../auth/loginAttempts.js";
import { createAuthService } from "../auth/service.js";
import { clearSessionCookie, setSessionCookie } from "../auth/session.js";
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";
import type { Mailer } from "../mail/index.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

interface AuthRouterDeps {
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

export function authRouter({
  db,
  env,
  mailer,
  logger,
}: AuthRouterDeps): Router {
  const router = Router();
  const service = createAuthService(db, { mailer, env, logger });
  const authenticate = requireAuth(db, env);
  const loginAttempts = new LoginAttemptTracker();
  // 5 requests per hour, per email + IP.
  const emailRequests = new AttemptLimiter(5, 60 * 60 * 1000);

  router.post(
    "/auth/register",
    validate({ body: RegisterRequestSchema }),
    async (req, res) => {
      const result = await service.register(
        req.validated?.body as RegisterRequest,
        requestMetadata(req)
      );
      setSessionCookie(res, env, result.token);
      res.status(201).json({ user: result.user });
    }
  );

  router.post(
    "/auth/login",
    validate({ body: LoginRequestSchema }),
    async (req, res) => {
      const input = req.validated?.body as LoginRequest;
      const metadata = requestMetadata(req);
      const attemptKey = `${metadata.ipAddress}:${input.email}`;
      if (loginAttempts.isBlocked(attemptKey)) {
        throw new HttpError(
          429,
          "RATE_LIMITED",
          "Too many failed login attempts, please try again later"
        );
      }
      try {
        const result = await service.login(input, metadata);
        loginAttempts.reset(attemptKey);
        setSessionCookie(res, env, result.token);
        res.json({ user: result.user });
      } catch (error) {
        if (error instanceof HttpError && error.code === "UNAUTHORIZED") {
          loginAttempts.recordFailure(attemptKey);
        }
        throw error;
      }
    }
  );

  router.post("/auth/logout", authenticate, async (req, res) => {
    await service.logout(req.auth!.session.id);
    clearSessionCookie(res, env);
    res.status(204).end();
  });

  router.post("/auth/logout-all", authenticate, async (req, res) => {
    await service.logoutAll(req.auth!.user.id);
    clearSessionCookie(res, env);
    res.status(204).end();
  });

  router.post("/auth/verify-email/request", authenticate, async (req, res) => {
    const user = req.auth!.user;
    const metadata = requestMetadata(req);
    const key = `verify:${metadata.ipAddress}:${user.email}`;
    if (emailRequests.isBlocked(key)) {
      throw new HttpError(
        429,
        "RATE_LIMITED",
        "Too many verification emails requested, please try again later"
      );
    }
    emailRequests.recordFailure(key);
    await service.requestEmailVerification(user, metadata);
    res.status(202).json({ status: "accepted" });
  });

  router.post(
    "/auth/verify-email/confirm",
    validate({ body: VerifyEmailConfirmSchema }),
    async (req, res) => {
      const { token } = req.validated?.body as VerifyEmailConfirmRequest;
      const user = await service.confirmEmailVerification(token);
      res.json({ user });
    }
  );

  router.post(
    "/auth/password-reset/request",
    validate({ body: PasswordResetRequestSchema }),
    async (req, res) => {
      const { email } = req.validated?.body as PasswordResetRequest;
      const metadata = requestMetadata(req);
      const key = `reset:${metadata.ipAddress}:${email}`;
      // Always 202, even when throttled: a different envelope would reveal
      // which addresses have accounts.
      if (!emailRequests.isBlocked(key)) {
        emailRequests.recordFailure(key);
        await service.requestPasswordReset(email, metadata);
      }
      res.status(202).json({ status: "accepted" });
    }
  );

  router.post(
    "/auth/password-reset/confirm",
    validate({ body: PasswordResetConfirmSchema }),
    async (req, res) => {
      const { token, password } = req.validated
        ?.body as PasswordResetConfirmRequest;
      await service.confirmPasswordReset(token, password);
      res.json({ status: "reset" });
    }
  );

  router.get("/me", authenticate, (req, res) => {
    const user = req.auth!.user;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerifiedAt !== null,
      },
    });
  });

  return router;
}
