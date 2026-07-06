import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { HttpError } from "../errors.js";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

// Express 5 exposes req.query/req.params through getters, so parsed values
// are stored on req.validated instead of being written back.
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.validated ??= {};
    for (const key of ["body", "query", "params"] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        next(
          new HttpError(
            400,
            "BAD_REQUEST",
            `Invalid request ${key}`,
            result.error.issues,
          ),
        );
        return;
      }
      req.validated[key] = result.data;
    }
    next();
  };
}
