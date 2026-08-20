import type { WorkerRuntime } from "./runtime.js";
import type { WorkerTelemetry } from "./telemetry.js";

export type WorkerShutdownSignal = "SIGINT" | "SIGTERM";
export type WorkerShutdownTrigger = WorkerShutdownSignal | "FATAL";

interface WorkerShutdownDeps {
  runtime: Pick<WorkerRuntime, "stopAcceptingClaims" | "drain">;
  close: () => Promise<void>;
  telemetry: WorkerTelemetry;
  forceExit: (code: number) => never;
  gracePeriodMs: number;
  scheduleTimeout?: (callback: () => void, delayMs: number) => NodeJS.Timeout;
  clearScheduledTimeout?: (timer: NodeJS.Timeout) => void;
}

export type GracefulWorkerShutdown = (
  signal: WorkerShutdownTrigger
) => Promise<0 | 1>;

export function createGracefulWorkerShutdown({
  runtime,
  close,
  telemetry,
  forceExit,
  gracePeriodMs,
  scheduleTimeout = setTimeout,
  clearScheduledTimeout = clearTimeout,
}: WorkerShutdownDeps): GracefulWorkerShutdown {
  let state: "idle" | "shutting-down" | "finished" = "idle";
  let shutdownPromise: Promise<0 | 1> | undefined;

  const forceShutdown = (signal: WorkerShutdownTrigger, reason: string) => {
    telemetry.error("worker.shutdown-forced", { signal, reason });
    forceExit(1);
  };

  const run = async (signal: WorkerShutdownTrigger): Promise<0 | 1> => {
    runtime.stopAcceptingClaims(signal);
    const timeout = scheduleTimeout(
      () => forceShutdown(signal, "grace-period-elapsed"),
      gracePeriodMs
    );

    let exitCode: 0 | 1 = 0;
    try {
      await runtime.drain();
    } catch {
      exitCode = 1;
    }
    try {
      await close();
    } catch {
      exitCode = 1;
    }

    if (timeout) clearScheduledTimeout(timeout);
    state = "finished";
    telemetry.info("worker.stopped", {
      status: exitCode === 0 ? "ok" : "error",
    });
    return exitCode;
  };

  return (signal) => {
    if (state === "finished" || state === "shutting-down") {
      if (state === "shutting-down" && signal !== "FATAL") {
        forceShutdown(signal, "additional-shutdown-signal");
      }
      return shutdownPromise!;
    }
    state = "shutting-down";
    shutdownPromise = run(signal);
    return shutdownPromise;
  };
}
