import type { NextFunction, Request, Response } from "express";
import type { Logger } from "pino";
import { HttpError } from "../errors.js";

export function errorHandler(logger: Logger) {
  return (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
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
