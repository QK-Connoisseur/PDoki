import { describe, expect, it } from "vitest";
import request from "supertest";
import express from "express";
import { pino } from "pino";
import { z } from "zod";
import { ApiErrorSchema } from "@pumdoki/contracts";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { validate } from "./middleware/validate.js";

function appWithValidatedRoute() {
  const app = express();
  app.use(requestId);
  app.use(express.json());
  app.post(
    "/echo",
    validate({ body: z.object({ name: z.string().min(1) }) }),
    (req, res) => {
      res.json({ received: req.validated?.body });
    }
  );
  app.use(errorHandler(pino({ level: "silent" })));
  return app;
}

describe("validate middleware", () => {
  it("passes parsed body through req.validated", async () => {
    const res = await request(appWithValidatedRoute())
      .post("/echo")
      .send({ name: "Pumdoki" });
    expect(res.status).toBe(200);
    expect(res.body.received).toEqual({ name: "Pumdoki" });
  });

  it("rejects an invalid body with the BAD_REQUEST envelope and issues", async () => {
    const res = await request(appWithValidatedRoute())
      .post("/echo")
      .send({ name: "" });
    expect(res.status).toBe(400);
    const parsed = ApiErrorSchema.parse(res.body);
    expect(parsed.error.code).toBe("BAD_REQUEST");
    expect(Array.isArray(parsed.error.details)).toBe(true);
  });
});
