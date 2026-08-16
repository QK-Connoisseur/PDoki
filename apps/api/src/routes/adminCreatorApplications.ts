import type {
  CreatorApplicationReviewParams,
  ReviewCreatorApplicationRequest,
} from "@pumdoki/contracts";
import {
  CreatorApplicationReviewParamsSchema,
  ReviewCreatorApplicationRequestSchema,
  ReviewCreatorApplicationResponseSchema,
} from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { Router, type Request } from "express";
import { createCreatorApplicationService } from "../creatorApplications/service.js";
import type { Env } from "../env.js";
import { validate } from "../middleware/validate.js";
import {
  CREATOR_APPLICATION_REVIEW_PERMISSION,
  type OperationsAccessVerifier,
  requireOperationsAccess,
} from "../operations/access.js";

interface AdminCreatorApplicationsRouterDeps {
  db: PrismaClient;
  env: Env;
  operationsAccessVerifier: OperationsAccessVerifier;
}

function requestPeerIp(req: Request): string | null {
  return req.socket.remoteAddress ?? null;
}

export function adminCreatorApplicationsRouter({
  db,
  env,
  operationsAccessVerifier,
}: AdminCreatorApplicationsRouterDeps): Router {
  const router = Router();
  const reviewAccess = requireOperationsAccess({
    db,
    env,
    verifier: operationsAccessVerifier,
    permission: CREATOR_APPLICATION_REVIEW_PERMISSION,
  });
  const service = createCreatorApplicationService(db);

  router.patch(
    "/admin/creator-applications/:applicationId",
    reviewAccess,
    validate({
      params: CreatorApplicationReviewParamsSchema,
      body: ReviewCreatorApplicationRequestSchema,
    }),
    async (req, res) => {
      const params = req.validated?.params as CreatorApplicationReviewParams;
      const review = await service.review(
        params.applicationId,
        req.operationsAuth!.user.id,
        req.validated?.body as ReviewCreatorApplicationRequest,
        req.requestId,
        requestPeerIp(req)
      );
      res.json(ReviewCreatorApplicationResponseSchema.parse(review));
    }
  );

  return router;
}
