import cors from "cors";
import express, { type Express, type Request } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { Logger } from "pino";
import type { PrismaClient } from "@pumdoki/database";
import type { Mailer } from "./mail/index.js";
import type { Env } from "./env.js";
import { HttpError } from "./errors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { accountRouter } from "./routes/account.js";
import { authRouter } from "./routes/auth.js";
import { creatorApplicationsRouter } from "./routes/creatorApplications.js";
import { healthRouter } from "./routes/health.js";
import { preferencesRouter } from "./routes/preferences.js";
import { readyRouter } from "./routes/ready.js";

export interface AppDeps {
  env: Env;
  logger: Logger;
  checkDatabase: () => Promise<boolean>;
  version: string;
  db: PrismaClient;
  mailer: Mailer;
}

export function createApp({
  env,
  logger,
  checkDatabase,
  version,
  db,
  mailer,
}: AppDeps): Express {
  const app = express();
  app.disable("x-powered-by");

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: (req as Request).requestId }),
    })
  );
  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests, please try again later",
            requestId: (req as Request).requestId,
          },
        });
      },
    })
  );

  const api = express.Router();
  api.use(healthRouter(version));
  api.use(readyRouter(checkDatabase));
  api.use(authRouter({ db, env, mailer, logger }));
  api.use(accountRouter({ db, env, mailer, logger }));
  api.use(creatorApplicationsRouter({ db, env, mailer, logger }));
  api.use(preferencesRouter({ db, env }));
  app.use("/api/v1", api);

  app.use((req, _res, next) => {
    next(
      new HttpError(404, "NOT_FOUND", `No route for ${req.method} ${req.path}`)
    );
  });
  app.use(errorHandler(logger));

  return app;
}
