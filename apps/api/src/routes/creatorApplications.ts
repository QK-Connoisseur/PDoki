import type { CreateCreatorApplicationRequest } from "@pumdoki/contracts";
import { CreateCreatorApplicationRequestSchema } from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { Router, type Request } from "express";
import { createCreatorApplicationService } from "../creatorApplications/service.js";
import type { Env } from "../env.js";
import {
  requireAuth,
  requireRole,
  requireVerifiedEmail,
} from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

interface CreatorApplicationsRouterDeps {
  db: PrismaClient;
  env: Env;
}

function requestIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

export function creatorApplicationsRouter({
  db,
  env,
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
      const application = await service.submit(
        req.auth!.user.id,
        req.validated?.body as CreateCreatorApplicationRequest,
        requestIp(req)
      );
      res.status(201).json({ application });
    }
  );

  return router;
}
