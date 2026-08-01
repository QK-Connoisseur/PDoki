import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "@pumdoki/contracts";
import type {
  PrismaClient,
  User,
  VerificationTokenKind,
} from "@pumdoki/database";
import type { Logger } from "pino";
import type { Env } from "../env.js";
import { HttpError } from "../errors.js";
import {
  renderPasswordResetEmail,
  renderVerificationEmail,
  sendSafely,
  type Mailer,
} from "../mail/index.js";
import {
  hashPassword,
  runDummyPasswordVerify,
  verifyPassword,
} from "./passwords.js";
import { createSessionToken, SESSION_DURATION_MS } from "./session.js";
import {
  buildTokenUrl,
  createVerificationToken,
  hashVerificationToken,
  tokenTtlMs,
} from "./tokens.js";

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

export interface AuthServiceDeps {
  mailer: Mailer;
  env: Env;
  logger: Logger;
}

export function createAuthService(db: PrismaClient, deps: AuthServiceDeps) {
  async function issueToken(
    userId: string,
    kind: VerificationTokenKind,
    ipAddress?: string
  ): Promise<string> {
    const { token, tokenHash } = createVerificationToken();
    const now = new Date();
    await db.$transaction(async (tx) => {
      await tx.verificationToken.updateMany({
        where: { userId, kind, consumedAt: null },
        data: { consumedAt: now },
      });
      await tx.verificationToken.create({
        data: {
          userId,
          kind,
          tokenHash,
          expiresAt: new Date(now.getTime() + tokenTtlMs(kind)),
          requestedIp: ipAddress,
        },
      });
    });
    return token;
  }

  async function sendVerificationMail(
    user: Pick<User, "id" | "email" | "displayName">,
    ipAddress?: string
  ): Promise<void> {
    const token = await issueToken(user.id, "EMAIL_VERIFICATION", ipAddress);
    await sendSafely(
      deps.mailer,
      deps.logger,
      renderVerificationEmail({
        to: user.email,
        displayName: user.displayName,
        url: buildTokenUrl(deps.env.WEB_ORIGIN, "EMAIL_VERIFICATION", token),
      })
    );
  }

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
              preference: { create: {} },
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

        try {
          await sendVerificationMail(user);
        } catch (mailError) {
          deps.logger.error(
            { err: mailError, userId: user.id },
            "Failed to send verification mail during registration"
          );
        }

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

    async requestEmailVerification(
      user: User,
      metadata: RequestMetadata
    ): Promise<void> {
      if (user.emailVerifiedAt !== null) return;
      await sendVerificationMail(user, metadata.ipAddress);
    },

    async confirmEmailVerification(token: string): Promise<AuthUser> {
      const record = await db.verificationToken.findUnique({
        where: { tokenHash: hashVerificationToken(token) },
        include: { user: true },
      });
      if (
        !record ||
        record.kind !== "EMAIL_VERIFICATION" ||
        record.consumedAt !== null
      ) {
        throw new HttpError(400, "INVALID_TOKEN", "This link is not valid");
      }
      if (record.expiresAt.getTime() <= Date.now()) {
        throw new HttpError(400, "TOKEN_EXPIRED", "This link has expired");
      }

      const now = new Date();
      const updated = await db.$transaction(async (tx) => {
        const consumed = await tx.verificationToken.updateMany({
          where: { id: record.id, consumedAt: null },
          data: { consumedAt: now },
        });
        if (consumed.count !== 1) {
          throw new HttpError(400, "INVALID_TOKEN", "This link is not valid");
        }
        return tx.user.update({
          where: { id: record.userId },
          data: { emailVerifiedAt: record.user.emailVerifiedAt ?? now },
        });
      });
      return toAuthUser(updated);
    },

    async requestPasswordReset(
      email: string,
      metadata: RequestMetadata
    ): Promise<void> {
      const user = await db.user.findUnique({ where: { email } });
      if (!user || user.status === "BANNED") return;

      const token = await issueToken(
        user.id,
        "PASSWORD_RESET",
        metadata.ipAddress
      );
      await sendSafely(
        deps.mailer,
        deps.logger,
        renderPasswordResetEmail({
          to: user.email,
          displayName: user.displayName,
          url: buildTokenUrl(deps.env.WEB_ORIGIN, "PASSWORD_RESET", token),
        })
      );
    },

    async confirmPasswordReset(token: string, password: string): Promise<void> {
      const record = await db.verificationToken.findUnique({
        where: { tokenHash: hashVerificationToken(token) },
        include: { user: true },
      });
      if (
        !record ||
        record.kind !== "PASSWORD_RESET" ||
        record.consumedAt !== null
      ) {
        throw new HttpError(400, "INVALID_TOKEN", "This link is not valid");
      }
      if (record.expiresAt.getTime() <= Date.now()) {
        throw new HttpError(400, "TOKEN_EXPIRED", "This link has expired");
      }

      const passwordHash = await hashPassword(password);
      const now = new Date();
      await db.$transaction(async (tx) => {
        const consumed = await tx.verificationToken.updateMany({
          where: { id: record.id, consumedAt: null },
          data: { consumedAt: now },
        });
        if (consumed.count !== 1) {
          throw new HttpError(400, "INVALID_TOKEN", "This link is not valid");
        }
        await tx.user.update({
          where: { id: record.userId },
          data: {
            passwordHash,
            emailVerifiedAt: record.user.emailVerifiedAt ?? now,
          },
        });
        await tx.session.updateMany({
          where: { userId: record.userId, revokedAt: null },
          data: { revokedAt: now },
        });
      });
    },
  };
}
