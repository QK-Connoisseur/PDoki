import type { PrismaClient } from "@pumdoki/database";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";

export const CREATOR_APPLICATION_REVIEW_PERMISSION =
  "creator_applications.review" as const;

export type OperationsPermission = typeof CREATOR_APPLICATION_REVIEW_PERMISSION;

const OperationsPrincipalSchema = z
  .object({
    userId: z.uuid(),
    subject: z
      .string()
      .min(1)
      .max(512)
      .refine((value) => value === value.trim()),
    assurance: z.enum(["MFA", "TEST"]),
    permissions: z
      .array(z.literal(CREATOR_APPLICATION_REVIEW_PERMISSION))
      .max(1)
      .readonly(),
  })
  .strict();

export type OperationsPrincipal = z.infer<typeof OperationsPrincipalSchema>;

export class OperationsAuthenticationError extends Error {
  constructor(message = "Invalid operational authentication") {
    super(message);
    this.name = "OperationsAuthenticationError";
  }
}

/**
 * A verifier may return a principal only after validating the complete
 * private-operations request boundary. The public API server intentionally
 * provides no implementation in this slice.
 */
export type OperationsAccessVerifier = (req: Request) => Promise<unknown>;

interface RequireOperationsAccessOptions {
  db: PrismaClient;
  env: Env;
  verifier: OperationsAccessVerifier;
  permission: OperationsPermission;
}

export function requireOperationsAccess({
  db,
  env,
  verifier,
  permission,
}: RequireOperationsAccessOptions): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let candidate: unknown;
      try {
        candidate = await verifier(req);
      } catch (error) {
        if (error instanceof OperationsAuthenticationError) {
          throw new HttpError(
            401,
            "UNAUTHORIZED",
            "Operational authentication required"
          );
        }
        throw error;
      }

      const parsed = OperationsPrincipalSchema.safeParse(candidate);
      if (!parsed.success) {
        throw new HttpError(
          401,
          "UNAUTHORIZED",
          "Operational authentication required"
        );
      }
      const principal = parsed.data;
      const assuranceAccepted =
        principal.assurance === "MFA" ||
        (env.NODE_ENV === "test" && principal.assurance === "TEST");
      if (!assuranceAccepted || !principal.permissions.includes(permission)) {
        throw new HttpError(
          403,
          "FORBIDDEN",
          "Insufficient operational permissions"
        );
      }

      const user = await db.user.findUnique({
        where: { id: principal.userId },
      });
      if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
        throw new HttpError(
          403,
          "FORBIDDEN",
          "Insufficient operational permissions"
        );
      }

      Object.defineProperty(req, "operationsAuth", {
        value: { principal, user },
        configurable: true,
        enumerable: true,
        writable: true,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}
