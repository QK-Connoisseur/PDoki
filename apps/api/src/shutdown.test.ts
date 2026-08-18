import { get, createServer } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SHUTDOWN_GRACE_MS,
  createGracefulShutdown,
} from "./shutdown.js";

type CloseCallback = (error?: Error) => void;

class ForcedExit extends Error {
  constructor(readonly code: number) {
    super(`forced exit ${code}`);
  }
}

function createHarness(disconnect = vi.fn(async () => undefined)) {
  let closeCallback: CloseCallback | undefined;
  const server = {
    close: vi.fn((callback: CloseCallback) => {
      closeCallback = callback;
      return server;
    }),
    closeIdleConnections: vi.fn(),
    closeAllConnections: vi.fn(),
  };
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const forceExit = vi.fn((code: number): never => {
    throw new ForcedExit(code);
  });
  const shutdown = createGracefulShutdown({
    server,
    disconnect,
    logger,
    forceExit,
  });

  return {
    server,
    disconnect,
    logger,
    forceExit,
    shutdown,
    completeClose(error?: Error) {
      if (!closeCallback) throw new Error("server.close was not called");
      closeCallback(error);
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("createGracefulShutdown", () => {
  it("stops accepting requests, disconnects the database, and completes cleanly", async () => {
    let finishDisconnect: (() => void) | undefined;
    const disconnect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishDisconnect = resolve;
        })
    );
    const harness = createHarness(disconnect);

    const completion = harness.shutdown("SIGTERM");

    expect(harness.server.close).toHaveBeenCalledOnce();
    expect(harness.server.closeIdleConnections).toHaveBeenCalledOnce();
    expect(harness.disconnect).not.toHaveBeenCalled();

    harness.completeClose();
    await Promise.resolve();

    expect(harness.disconnect).toHaveBeenCalledOnce();
    expect(harness.forceExit).not.toHaveBeenCalled();
    expect(harness.server.closeAllConnections).not.toHaveBeenCalled();

    if (!finishDisconnect) throw new Error("database disconnect did not start");
    finishDisconnect();
    await expect(completion).resolves.toBe(0);
  });

  it("requests an immediate hard exit when another signal arrives", async () => {
    const harness = createHarness();

    const first = harness.shutdown("SIGTERM");
    expect(() => harness.shutdown("SIGINT")).toThrow(ForcedExit);

    expect(harness.server.close).toHaveBeenCalledOnce();
    expect(harness.server.closeAllConnections).toHaveBeenCalledOnce();
    expect(harness.disconnect).not.toHaveBeenCalled();
    expect(harness.forceExit).toHaveBeenCalledOnce();
    expect(harness.forceExit).toHaveBeenCalledWith(1);

    // Complete the artificial pending drain after observing the hard-exit call.
    harness.completeClose();
    await expect(first).resolves.toBe(0);
  });

  it("forces shutdown after the grace period expires", async () => {
    vi.useFakeTimers();
    const harness = createHarness();

    const completion = harness.shutdown("SIGTERM");
    await expect(
      vi.advanceTimersByTimeAsync(DEFAULT_SHUTDOWN_GRACE_MS)
    ).rejects.toMatchObject({ code: 1 });

    expect(harness.server.closeAllConnections).toHaveBeenCalledOnce();
    expect(harness.disconnect).not.toHaveBeenCalled();
    expect(harness.forceExit).toHaveBeenCalledWith(1);

    harness.completeClose();
    await expect(completion).resolves.toBe(0);
  });

  it("keeps the grace deadline active while the database disconnects", async () => {
    vi.useFakeTimers();
    let finishDisconnect: (() => void) | undefined;
    const disconnect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishDisconnect = resolve;
        })
    );
    const harness = createHarness(disconnect);

    const completion = harness.shutdown("SIGTERM");
    harness.completeClose();
    await Promise.resolve();
    expect(disconnect).toHaveBeenCalledOnce();

    await expect(
      vi.advanceTimersByTimeAsync(DEFAULT_SHUTDOWN_GRACE_MS)
    ).rejects.toMatchObject({ code: 1 });
    expect(harness.server.closeAllConnections).toHaveBeenCalledOnce();
    expect(harness.forceExit).toHaveBeenCalledWith(1);

    if (!finishDisconnect) throw new Error("database disconnect did not start");
    finishDisconnect();
    await expect(completion).resolves.toBe(0);
    expect(harness.forceExit).toHaveBeenCalledOnce();
  });

  it("returns an unsuccessful code when the HTTP server cannot close", async () => {
    const harness = createHarness();

    const completion = harness.shutdown("SIGTERM");
    harness.completeClose(new Error("close failed"));

    await expect(completion).resolves.toBe(1);
    expect(harness.disconnect).toHaveBeenCalledOnce();
    expect(harness.forceExit).not.toHaveBeenCalled();
    expect(harness.logger.error).toHaveBeenCalled();
  });

  it("returns an unsuccessful code when the database cannot disconnect", async () => {
    const disconnect = vi.fn(async () => {
      throw new Error("disconnect failed");
    });
    const harness = createHarness(disconnect);

    const completion = harness.shutdown("SIGTERM");
    harness.completeClose();
    await expect(completion).resolves.toBe(1);

    expect(disconnect).toHaveBeenCalledOnce();
    expect(harness.forceExit).not.toHaveBeenCalled();
    expect(harness.logger.error).toHaveBeenCalled();
  });

  it("drains a real in-flight HTTP response before completing", async () => {
    let releaseResponse: (() => void) | undefined;
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    let markRequestStarted: (() => void) | undefined;
    const requestStarted = new Promise<void>((resolve) => {
      markRequestStarted = resolve;
    });
    const server = createServer((_req, res) => {
      markRequestStarted?.();
      void responseGate.then(() => res.end("ok"));
    });

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        server.off("error", reject);
        resolve();
      });
    });

    try {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("test server has no TCP address");
      }
      const responseFinished = new Promise<void>((resolve, reject) => {
        const request = get(
          {
            host: "127.0.0.1",
            port: address.port,
            path: "/",
            agent: false,
            headers: { connection: "close" },
          },
          (response) => {
            response.resume();
            response.once("end", resolve);
          }
        );
        request.once("error", reject);
      });
      await requestStarted;

      const disconnect = vi.fn(async () => undefined);
      const forceExit = vi.fn((_code: number): never => {
        throw new Error("unexpected forced exit");
      });
      const shutdown = createGracefulShutdown({
        server,
        disconnect,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        forceExit,
        gracePeriodMs: 5_000,
      });

      let completed = false;
      const completion = shutdown("SIGTERM").then((code) => {
        completed = true;
        return code;
      });
      await new Promise<void>((resolve) => setImmediate(resolve));

      expect(completed).toBe(false);
      expect(server.listening).toBe(false);
      expect(disconnect).not.toHaveBeenCalled();

      releaseResponse?.();
      await responseFinished;
      await expect(completion).resolves.toBe(0);
      expect(disconnect).toHaveBeenCalledOnce();
      expect(forceExit).not.toHaveBeenCalled();
    } finally {
      releaseResponse?.();
      server.closeAllConnections();
      if (server.listening) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    }
  });
});
