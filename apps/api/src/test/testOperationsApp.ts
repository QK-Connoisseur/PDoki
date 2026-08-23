import express, { type Express } from "express";
import { pino } from "pino";
import type { PrismaClient } from "@pumdoki/database";
import { loadEnv } from "../env.js";
import { HttpError } from "../errors.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { requestId } from "../middleware/requestId.js";
import type { OperationsAccessVerifier } from "../operations/access.js";
import {
  operationsJsonBody,
  requireOperationsRequestIntegrity,
  type OperationsCsrfVerifier,
} from "../operations/requestIntegrity.js";
import { adminCreatorApplicationsRouter } from "../routes/adminCreatorApplications.js";

export const TEST_OPERATIONS_ORIGIN = "https://private-operations.pumdoki.test";
export const TEST_OPERATIONS_CSRF = "test-only-operations-csrf-proof";

export function testOperationsApp({
  db,
  operationsAccessVerifier,
  verifyCsrf = async (req) =>
    req.get("x-operations-csrf") === TEST_OPERATIONS_CSRF,
}: {
  db: PrismaClient;
  operationsAccessVerifier: OperationsAccessVerifier;
  verifyCsrf?: OperationsCsrfVerifier;
}): Express {
  const env = loadEnv({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost:5432/pumdoki_test",
  } as NodeJS.ProcessEnv);
  const logger = pino({ level: "silent" });
  const app = express();

  app.use(requestId);
  app.use(
    requireOperationsRequestIntegrity({
      allowedOrigin: TEST_OPERATIONS_ORIGIN,
      verifyCsrf,
    })
  );
  app.use(operationsJsonBody());
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
