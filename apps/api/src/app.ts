import express, { type Express, type Request } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { Logger } from "pino";
import type { Env } from "./env.js";
import { HttpError } from "./errors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { healthRouter } from "./routes/health.js";

export interface AppDeps {
  env: Env;
  logger: Logger;
  checkDatabase: () => Promise<boolean>;
  version: string;
}

export function createApp({
  env,
  logger,
  checkDatabase,
  version,
}: AppDeps): Express {
  void env;
  void checkDatabase;
  const app = express();
  app.disable("x-powered-by");

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: (req as Request).requestId }),
    }),
  );
  app.use(helmet());
  app.use(express.json({ limit: "100kb" }));

  const api = express.Router();
  api.use(healthRouter(version));
  app.use("/api/v1", api);

  app.use((req, _res, next) => {
    next(
      new HttpError(404, "NOT_FOUND", `No route for ${req.method} ${req.path}`),
    );
  });
  app.use(errorHandler(logger));

  return app;
}
