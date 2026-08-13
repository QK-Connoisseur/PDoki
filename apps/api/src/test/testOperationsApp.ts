import express, { type Express } from "express";
import { pino } from "pino";
import type { PrismaClient } from "@pumdoki/database";
import { loadEnv } from "../env.js";
import { HttpError } from "../errors.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { requestId } from "../middleware/requestId.js";
import type { OperationsAccessVerifier } from "../operations/access.js";
import { adminCreatorApplicationsRouter } from "../routes/adminCreatorApplications.js";

export function testOperationsApp({
  db,
  operationsAccessVerifier,
}: {
  db: PrismaClient;
  operationsAccessVerifier: OperationsAccessVerifier;
}): Express {
  const env = loadEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/pumdoki_test",
  } as NodeJS.ProcessEnv);
  const logger = pino({ level: "silent" });
  const app = express();

  app.use(requestId);
  app.use(express.json({ limit: "100kb" }));
  app.use(
    "/api/v1",
    adminCreatorApplicationsRouter({ db, env, operationsAccessVerifier })
  );
  app.use((req, _res, next) => {
    next(
      new HttpError(404, "NOT_FOUND", `No route for ${req.method} ${req.path}`)
    );
  });
  app.use(errorHandler(logger));

  return app;
}
