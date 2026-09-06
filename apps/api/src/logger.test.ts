import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { createLogger } from "./logger.js";

describe("logger credential redaction", () => {
  it("redacts public-session and private-operations credentials", () => {
    const chunks: string[] = [];
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });
    const logger = createLogger("info", destination);
    const credentials = {
      authorization: "Bearer signed-operations-assertion",
      "cf-access-jwt-assertion": "signed-cloudflare-access-assertion",
      cookie: "pumdoki_session=opaque-public-session",
      "x-csrf-token": "generic-csrf-proof",
      "x-operations-csrf": "operations-csrf-proof",
    };

    logger.info({ req: { headers: credentials } }, "redaction test");
    const output = chunks.join("");

    for (const credential of Object.values(credentials)) {
      expect(output).not.toContain(credential);
    }
    expect(output.match(/\[Redacted\]/g)).toHaveLength(5);
  });
});
