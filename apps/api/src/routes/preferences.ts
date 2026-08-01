import type { UpdateUserPreferencesRequest } from "@pumdoki/contracts";
import { UpdateUserPreferencesRequestSchema } from "@pumdoki/contracts";
import type { PrismaClient } from "@pumdoki/database";
import { Router } from "express";
import type { Env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

interface PreferencesRouterDeps {
  db: PrismaClient;
  env: Env;
}

export function preferencesRouter({ db, env }: PreferencesRouterDeps): Router {
  const router = Router();
  const authenticate = requireAuth(db, env);

  router.get("/me/preferences", authenticate, async (req, res) => {
    const preference = await db.userPreference.findUnique({
      where: { userId: req.auth!.user.id },
    });
    res.json({
      preferences: {
        showExplicitContent: preference?.showExplicitContent ?? false,
      },
    });
  });

  router.patch(
    "/me/preferences",
    authenticate,
    validate({ body: UpdateUserPreferencesRequestSchema }),
    async (req, res) => {
      const input = req.validated?.body as UpdateUserPreferencesRequest;
      const preference = await db.userPreference.upsert({
        where: { userId: req.auth!.user.id },
        create: {
          userId: req.auth!.user.id,
          showExplicitContent: input.showExplicitContent,
        },
        update: { showExplicitContent: input.showExplicitContent },
      });
      res.json({
        preferences: {
          showExplicitContent: preference.showExplicitContent,
        },
      });
    }
  );

  return router;
}
