import type { LoginRequest, RegisterRequest } from "@pumdoki/contracts";
import { LoginRequestSchema, RegisterRequestSchema } from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { Router, type Request } from "express";
import { LoginAttemptTracker } from "../auth/loginAttempts.js";
import { createAuthService } from "../auth/service.js";
import { clearSessionCookie, setSessionCookie } from "../auth/session.js";
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

interface AuthRouterDeps {
  db: PrismaClient;
  env: Env;
}

function requestMetadata(req: Request) {
  return {
    ipAddress: req.ip ?? req.socket.remoteAddress ?? "unknown",
    userAgent: req.get("user-agent")?.slice(0, 512),
  };
}

export function authRouter({ db, env }: AuthRouterDeps): Router {
  const router = Router();
  const service = createAuthService(db);
  const authenticate = requireAuth(db, env);
  const loginAttempts = new LoginAttemptTracker();

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
