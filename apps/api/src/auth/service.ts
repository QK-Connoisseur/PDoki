import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "@pumdoki/contracts";
import type { PrismaClient, User } from "@pumdoki/database";
import { HttpError } from "../errors.js";
import {
  hashPassword,
  runDummyPasswordVerify,
  verifyPassword,
} from "./passwords.js";
import { createSessionToken, SESSION_DURATION_MS } from "./session.js";

export interface RequestMetadata {
  ipAddress: string;
  userAgent?: string;
}

interface AuthResult {
  user: AuthUser;
  token: string;
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    emailVerified: user.emailVerifiedAt !== null,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export function createAuthService(db: PrismaClient) {
  return {
    async register(
      input: RegisterRequest,
      metadata: RequestMetadata
    ): Promise<AuthResult> {
      const passwordHash = await hashPassword(input.password);
      const { token, tokenHash } = createSessionToken();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

      try {
        const user = await db.$transaction(async (tx) => {
          const created = await tx.user.create({
            data: {
              email: input.email,
              passwordHash,
              displayName: input.displayName,
            },
          });
          await tx.acceptanceRecord.createMany({
            data: [
              {
                userId: created.id,
                kind: "TERMS",
                version: input.acceptedTermsVersion,
                acceptedAt: now,
                ipAddress: metadata.ipAddress,
              },
              {
                userId: created.id,
                kind: "PRIVACY",
                version: input.acceptedPrivacyVersion,
                acceptedAt: now,
                ipAddress: metadata.ipAddress,
              },
              {
                userId: created.id,
                kind: "AGE_ATTESTATION",
                version: null,
                acceptedAt: now,
                ipAddress: metadata.ipAddress,
              },
            ],
          });
          await tx.session.create({
            data: {
              userId: created.id,
              tokenHash,
              expiresAt,
              ipAddress: metadata.ipAddress,
              userAgent: metadata.userAgent,
              lastExtendedAt: now,
            },
          });
          return created;
        });
        return { user: toAuthUser(user), token };
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new HttpError(409, "CONFLICT", "An account already exists");
        }
        throw error;
      }
    },

    async login(
      input: LoginRequest,
      metadata: RequestMetadata
    ): Promise<AuthResult> {
      const user = await db.user.findUnique({ where: { email: input.email } });
      if (!user) {
        await runDummyPasswordVerify(input.password);
        throw new HttpError(401, "UNAUTHORIZED", "Invalid email or password");
      }

      const verification = await verifyPassword(
        user.passwordHash,
        input.password
      );
      if (!verification.valid) {
        throw new HttpError(401, "UNAUTHORIZED", "Invalid email or password");
      }
      if (user.status !== "ACTIVE") {
        throw new HttpError(403, "FORBIDDEN", "Account access is restricted");
      }

      if (verification.needsRehash) {
        user.passwordHash = await hashPassword(input.password);
        await db.user.update({
          where: { id: user.id },
          data: { passwordHash: user.passwordHash },
        });
      }

      const { token, tokenHash } = createSessionToken();
      const now = new Date();
      await db.session.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(now.getTime() + SESSION_DURATION_MS),
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          lastExtendedAt: now,
        },
      });
      return { user: toAuthUser(user), token };
    },

    async logout(sessionId: string): Promise<void> {
      await db.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    },

    async logoutAll(userId: string): Promise<void> {
      await db.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    },
  };
}
