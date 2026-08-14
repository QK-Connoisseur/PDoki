import { createRequire } from "node:module";
import { createApp } from "./app.js";
import { checkDatabase, prisma } from "./db.js";
import { loadEnv } from "./env.js";
import { createLogger } from "./logger.js";
import { createMailer } from "./mail/index.js";
import { createGracefulShutdown } from "./shutdown.js";

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
  mailer: createMailer(env, logger),
});

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "pumdoki api listening");
});

const shutdown = createGracefulShutdown({
  server,
  disconnect: () => prisma.$disconnect(),
  logger,
  forceExit: (code) => process.exit(code),
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal).then(
      (code) => process.exit(code),
      (error: unknown) => {
        logger.error(
          { err: error, signal },
          "api shutdown failed unexpectedly"
        );
        process.exit(1);
      }
    );
  });
}
