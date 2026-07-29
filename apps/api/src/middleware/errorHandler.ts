import type { NextFunction, Request, Response } from "express";
import type { Logger } from "pino";
import { HttpError } from "../errors.js";

interface JsonParseError extends SyntaxError {
  status?: number;
  type?: string;
}

function isJsonParseError(err: unknown): err is JsonParseError {
  return (
    err instanceof SyntaxError &&
    (err as JsonParseError).status === 400 &&
    (err as JsonParseError).type === "entity.parse.failed"
  );
}

export function errorHandler(logger: Logger) {
  return (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    const requestId = req.requestId ?? "unknown";
    if (err instanceof HttpError) {
      res.status(err.status).json({
        error: {
          code: err.code,
          message: err.message,
          requestId,
          ...(err.details === undefined ? {} : { details: err.details }),
        },
      });
      return;
    }
    if (isJsonParseError(err)) {
      res.status(400).json({
        error: {
          code: "BAD_REQUEST",
          message: "Malformed JSON request body",
          requestId,
        },
      });
      return;
    }
    logger.error({ err, requestId }, "unhandled error");
    res.status(500).json({
      error: {
        code: "INTERNAL",
        message: "Internal server error",
        requestId,
      },
    });
  };
}
