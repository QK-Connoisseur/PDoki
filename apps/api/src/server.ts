import { createRequire } from "node:module";
import { createApp } from "./app.js";
import { checkDatabase, prisma } from "./db.js";
import { loadEnv } from "./env.js";
import { createLogger } from "./logger.js";

const pkg = createRequire(import.meta.url)("../package.json") as {
  version: string;
};

const env = loadEnv();
const logger = createLogger(env.LOG_LEVEL);
const app = createApp({
  env,
  logger,
  checkDatabase,
  version: pkg.version,
  db: prisma,
});

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "pumdoki api listening");
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    logger.info({ signal }, "shutting down");
    server.close(() => process.exit(0));
  });
}
