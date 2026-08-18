import type { Server } from "node:http";

export const DEFAULT_SHUTDOWN_GRACE_MS = 30_000;

export type ShutdownSignal = "SIGINT" | "SIGTERM";

interface ShutdownLogger {
  info(bindings: object, message: string): void;
  warn(bindings: object, message: string): void;
  error(bindings: object, message: string): void;
}

interface GracefulShutdownDeps {
  server: Pick<
    Server,
    "close" | "closeAllConnections" | "closeIdleConnections"
  >;
  disconnect: () => Promise<void>;
  logger: ShutdownLogger;
  forceExit: (code: number) => never;
  gracePeriodMs?: number;
  scheduleTimeout?: (callback: () => void, delayMs: number) => NodeJS.Timeout;
  clearScheduledTimeout?: (timer: NodeJS.Timeout) => void;
}

interface CloseResult {
  exitCode: 0 | 1;
}

export type GracefulShutdown = (
  signal: ShutdownSignal
) => Promise<CloseResult["exitCode"]>;

export function createGracefulShutdown({
  server,
  disconnect,
  logger,
  forceExit,
  gracePeriodMs = DEFAULT_SHUTDOWN_GRACE_MS,
  scheduleTimeout = setTimeout,
  clearScheduledTimeout = clearTimeout,
}: GracefulShutdownDeps): GracefulShutdown {
  let state: "idle" | "shutting-down" | "finished" = "idle";
  let shutdownPromise: Promise<CloseResult["exitCode"]> | undefined;
  let settleClose: ((result: CloseResult) => void) | undefined;
  let closeSettled = false;

  const settleCloseOnce = (result: CloseResult) => {
    if (closeSettled) return;
    closeSettled = true;
    settleClose?.(result);
  };

  const forceClose = (signal: ShutdownSignal, reason: string) => {
    logger.warn({ signal, reason }, "forcing api shutdown");
    try {
      server.closeAllConnections();
    } catch (error) {
      logger.error(
        { err: error, signal },
        "failed to force-close api connections"
      );
    }
    forceExit(1);
  };

  const runShutdown = async (signal: ShutdownSignal) => {
    let timeout: NodeJS.Timeout | undefined;
    const closeResult = await new Promise<CloseResult>((resolve) => {
      settleClose = resolve;

      timeout = scheduleTimeout(() => {
        forceClose(signal, "grace period elapsed");
      }, gracePeriodMs);

      try {
        server.close((error) => {
          if (error) {
            logger.error({ err: error, signal }, "api server close failed");
            settleCloseOnce({ exitCode: 1 });
            return;
          }
          settleCloseOnce({ exitCode: 0 });
        });
        server.closeIdleConnections();
      } catch (error) {
        logger.error({ err: error, signal }, "api server shutdown failed");
        settleCloseOnce({ exitCode: 1 });
      }
    });
    let exitCode = closeResult.exitCode;
    try {
      await disconnect();
    } catch (error) {
      exitCode = 1;
      logger.error({ err: error, signal }, "database disconnect failed");
    }

    if (timeout) clearScheduledTimeout(timeout);
    state = "finished";
    return exitCode;
  };

  return (signal) => {
    if (state === "finished") {
      return shutdownPromise!;
    }

    if (state === "shutting-down") {
      forceClose(signal, "additional shutdown signal received");
      return shutdownPromise!;
    }

    state = "shutting-down";
    logger.info({ signal }, "shutting down api");
    shutdownPromise = runShutdown(signal);
    return shutdownPromise;
  };
}
