import { Router } from "express";

export function readyRouter(checkDatabase: () => Promise<boolean>): Router {
  const router = Router();
  router.get("/ready", async (_req, res) => {
    const databaseUp = await checkDatabase().catch(() => false);
    res.status(databaseUp ? 200 : 503).json({
      status: databaseUp ? "ready" : "degraded",
      checks: { database: databaseUp ? "up" : "down" },
    });
  });
  return router;
}
