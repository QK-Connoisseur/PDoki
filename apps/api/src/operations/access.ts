import type { PrismaClient } from "@pumdoki/database";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";
import {
  CREATOR_APPLICATION_REVIEW_PERMISSION,
  OperationsAuthenticationError,
  type OperationsPermission,
  type VerifiedOperationsIdentity,
} from "./types.js";

export {
  CREATOR_APPLICATION_REVIEW_PERMISSION,
  OperationsAuthenticationError,
} from "./types.js";
export type { OperationsPermission } from "./types.js";

const VerifiedOperationsIdentitySchema = z
  .object({
    issuer: z
      .string()
      .min(1)
      .max(512)
      .refine((value) => value === value.trim()),
    subject: z
      .string()
      .min(1)
      .max(512)
      .refine((value) => value === value.trim()),
    assurance: z.enum(["MFA", "TEST"]),
  })
  .strict();

/**
 * The verifier authenticates only the external identity. Internal users,
 * operator provisioning, and permissions are always loaded from PostgreSQL.
 */
export type OperationsAccessVerifier = (req: Request) => Promise<unknown>;

interface RequireOperationsAccessOptions {
  db: PrismaClient;
  env: Env;
  verifier: OperationsAccessVerifier;
  permission: OperationsPermission;
}

function databasePermission(permission: OperationsPermission) {
  switch (permission) {
    case CREATOR_APPLICATION_REVIEW_PERMISSION:
      return "CREATOR_APPLICATION_REVIEW" as const;
  }
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

      const parsed = VerifiedOperationsIdentitySchema.safeParse(candidate);
      if (!parsed.success) {
        throw new HttpError(
          401,
          "UNAUTHORIZED",
          "Operational authentication required"
        );
      }
      const identity: VerifiedOperationsIdentity = parsed.data;
      const assuranceAccepted =
        identity.assurance === "MFA" ||
        (env.NODE_ENV === "test" && identity.assurance === "TEST");
      if (!assuranceAccepted) {
        throw new HttpError(
          403,
          "FORBIDDEN",
          "Insufficient operational permissions"
        );
      }

      const operator = await db.operationsOperator.findUnique({
        where: {
          issuer_subject: {
            issuer: identity.issuer,
            subject: identity.subject,
          },
        },
        include: {
          user: true,
          permissionGrants: {
            where: {
              permission: databasePermission(permission),
              revokedAt: null,
            },
            select: { permission: true },
          },
        },
      });
      if (
        !operator ||
        operator.disabledAt !== null ||
        operator.user.status !== "ACTIVE" ||
        operator.user.role !== "ADMIN" ||
        operator.permissionGrants.length !== 1
      ) {
        throw new HttpError(
          403,
          "FORBIDDEN",
          "Insufficient operational permissions"
        );
      }

      Object.defineProperty(req, "operationsAuth", {
        value: {
          identity,
          operator: {
            id: operator.id,
            userId: operator.userId,
            permissions: [permission],
          },
          user: operator.user,
        },
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
