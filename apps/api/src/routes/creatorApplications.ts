import type { CreateCreatorApplicationRequest } from "@pumdoki/contracts";
import { CreateCreatorApplicationRequestSchema } from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { Router, type Request } from "express";
import type { Logger } from "pino";
import { createCreatorApplicationService } from "../creatorApplications/service.js";
import type { Env } from "../env.js";
import {
  renderCreatorApplicationReceivedEmail,
  sendSafely,
  type Mailer,
} from "../mail/index.js";
import {
  requireAuth,
  requireRole,
  requireVerifiedEmail,
} from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

interface CreatorApplicationsRouterDeps {
  db: PrismaClient;
  env: Env;
  mailer: Mailer;
  logger: Logger;
}

function requestIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

export function creatorApplicationsRouter({
  db,
  env,
  mailer,
  logger,
}: CreatorApplicationsRouterDeps): Router {
  const router = Router();
  const authenticate = requireAuth(db, env);
  const memberOnly = requireRole("MEMBER");
  const service = createCreatorApplicationService(db);

  router.get(
    "/me/creator-application",
    authenticate,
    memberOnly,
    async (req, res) => {
      const application = await service.getForUser(req.auth!.user.id);
      res.json({ application });
    }
  );

  router.post(
    "/creator-applications",
    authenticate,
    memberOnly,
    requireVerifiedEmail(),
    validate({ body: CreateCreatorApplicationRequestSchema }),
    async (req, res) => {
      const { application, receiptEmail } = await service.submit(
        req.auth!.user.id,
        req.validated?.body as CreateCreatorApplicationRequest,
        requestIp(req)
      );
      await sendSafely(mailer, logger, "creator-application-received", () =>
        renderCreatorApplicationReceivedEmail({
          to: receiptEmail,
          statusUrl: new URL("/creator/onboarding", env.WEB_ORIGIN).toString(),
        })
      );
      res.status(201).json({ application });
    }
  );

  return router;
}
