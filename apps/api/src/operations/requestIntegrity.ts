import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import { HttpError } from "../errors.js";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const OPERATIONS_JSON_LIMIT = "16kb";

export type OperationsCsrfVerifier = (req: Request) => Promise<boolean>;

interface OperationsRequestIntegrityOptions {
  allowedOrigin: string;
  verifyCsrf: OperationsCsrfVerifier;
}

interface ParseError extends SyntaxError {
  status?: number;
  type?: string;
}

function exactOrigin(value: string): string {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.pathname !== "/" ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    parsed.origin !== value
  ) {
    throw new Error("Operations origin must be an exact HTTPS origin");
  }
  return parsed.origin;
}

function rawHeaderValues(req: Request, name: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < req.rawHeaders.length; index += 2) {
    if (req.rawHeaders[index]?.toLowerCase() === name.toLowerCase()) {
      values.push(req.rawHeaders[index + 1] ?? "");
    }
  }
  return values;
}

function requireSingleHeader(req: Request, name: string): string {
  const values = rawHeaderValues(req, name);
  if (values.length !== 1 || values[0] === "" || values[0].includes(",")) {
    throw new HttpError(403, "FORBIDDEN", "Operational request denied");
  }
  return values[0];
}

export function requireOperationsRequestIntegrity({
  allowedOrigin,
  verifyCsrf,
}: OperationsRequestIntegrityOptions): RequestHandler {
  const configuredOrigin = exactOrigin(allowedOrigin);

  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!MUTATION_METHODS.has(req.method)) {
      next();
      return;
    }

    try {
      const requestOrigin = requireSingleHeader(req, "origin");
      if (requestOrigin !== configuredOrigin) {
        throw new HttpError(403, "FORBIDDEN", "Operational request denied");
      }

      const contentType = requireSingleHeader(req, "content-type")
        .split(";", 1)[0]
        ?.trim()
        .toLowerCase();
      if (contentType !== "application/json") {
        throw new HttpError(
          400,
          "BAD_REQUEST",
          "Operational requests require JSON"
        );
      }

      if (!(await verifyCsrf(req))) {
        throw new HttpError(403, "FORBIDDEN", "Operational request denied");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function operationsJsonBody(): RequestHandler {
  const parser = express.json({ limit: OPERATIONS_JSON_LIMIT });
  return (req, res, next) => {
    parser(req, res, (error?: unknown) => {
      if (!error) {
        next();
        return;
      }
      const parseError = error as ParseError;
      if (parseError.status === 413 || parseError.type === "entity.too.large") {
        next(
          new HttpError(413, "BAD_REQUEST", "Operational request is too large")
        );
        return;
      }
      next(error);
    });
  };
}
