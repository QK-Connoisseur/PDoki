import { submitPhase2Canary } from "../durableJobs/enqueue.js";
import { createLogger } from "../logger.js";
import { parseCanaryCliInput } from "./canaryCli.js";

async function enqueueLocalCanary(): Promise<void> {
  const input = parseCanaryCliInput(process.argv.slice(2));
  const { prisma } = await import("../db.js");
  const logger = createLogger(process.env.LOG_LEVEL ?? "info").child({
    service: "phase2-canary-cli",
  });
  try {
    const submitted = await submitPhase2Canary(prisma, input);
    logger.info(
      {
        event: "phase2-canary.enqueued",
        canaryIntentId: submitted.canaryIntentId,
        jobId: submitted.jobId,
        replayed: submitted.replayed,
        requestId: input.requestId,
      },
      "local Phase 2 canary accepted"
    );
  } finally {
    await prisma.$disconnect();
  }
}

void enqueueLocalCanary().catch(() => {
  process.stderr.write(
    "Could not enqueue the local Phase 2 canary; no input or database details were logged\n"
  );
  process.exitCode = 1;
});
