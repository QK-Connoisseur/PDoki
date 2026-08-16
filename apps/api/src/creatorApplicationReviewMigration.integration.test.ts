import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const MIGRATIONS = [
  "20260706204710_init",
  "20260716211419_add_core_auth",
  "20260727104556_add_verification_tokens",
  "20260801103000_add_user_preferences",
  "20260801221000_add_creator_applications",
] as const;
const REVIEW_MIGRATION = "20260802100000_add_creator_application_review_events";

let client: Client;
let schemaName: string;
let schemaCreated = false;

function loadDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
    if (existsSync(rootEnv)) loadEnvFile(rootEnv);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for migration integration coverage"
    );
  }
  return process.env.DATABASE_URL;
}

async function migrationSql(migration: string): Promise<string> {
  const path = fileURLToPath(
    new URL(
      `../../../packages/database/prisma/migrations/${migration}/migration.sql`,
      import.meta.url
    )
  );
  return readFile(path, "utf8");
}

beforeAll(async () => {
  client = new Client({ connectionString: loadDatabaseUrl() });
  await client.connect();
  schemaName = `creator_review_${randomUUID().replaceAll("-", "_")}`;
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  schemaCreated = true;
  await client.query(`SET search_path TO "${schemaName}"`);
});

afterAll(async () => {
  if (!client) return;
  if (schemaCreated) {
    await client.query("SET search_path TO public");
    await client.query(`DROP SCHEMA "${schemaName}" CASCADE`);
  }
  await client.end();
});

describe("creator review migration", () => {
  it("preserves Slice 1 rows and adds constrained review evidence", async () => {
    for (const migration of MIGRATIONS) {
      await client.query(await migrationSql(migration));
    }

    const userId = randomUUID();
    const acceptanceId = randomUUID();
    const applicationId = randomUUID();
    const now = new Date("2026-08-12T12:00:00.000Z");

    await client.query(
      `INSERT INTO "User"
        ("id", "email", "passwordHash", "displayName", "emailVerifiedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $5, $5)`,
      [
        userId,
        "migration-applicant@pumdoki.example",
        "migration-test-hash",
        "Migration Applicant",
        now,
      ]
    );
    await client.query(
      `INSERT INTO "AcceptanceRecord"
        ("id", "userId", "kind", "version", "acceptedAt", "ipAddress")
       VALUES ($1, $2, 'CREATOR_AGREEMENT', $3, $4, $5)`,
      [acceptanceId, userId, "prototype-2026-08-01", now, "203.0.113.42"]
    );
    await client.query(
      `INSERT INTO "CreatorApplication"
        ("id", "userId", "creatorName", "countryCode", "submittedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $5, $5)`,
      [applicationId, userId, "Migration Studio", "US", now]
    );

    await client.query(await migrationSql(REVIEW_MIGRATION));

    const application = await client.query<{
      creatorName: string;
      status: string;
      identityVerificationStatus: string;
    }>(
      `SELECT "creatorName", "status", "identityVerificationStatus"
       FROM "CreatorApplication" WHERE "id" = $1`,
      [applicationId]
    );
    expect(application.rows).toEqual([
      {
        creatorName: "Migration Studio",
        status: "PENDING",
        identityVerificationStatus: "NOT_STARTED",
      },
    ]);

    const acceptance = await client.query<{ version: string }>(
      `SELECT "version" FROM "AcceptanceRecord" WHERE "id" = $1`,
      [acceptanceId]
    );
    expect(acceptance.rows).toEqual([{ version: "prototype-2026-08-01" }]);

    await client.query(
      `INSERT INTO "CreatorApplicationReviewEvent"
        ("id", "creatorApplicationId", "reviewerUserId", "fromStatus", "toStatus", "reason", "requestId", "requestIp")
       VALUES ($1, $2, $3, 'PENDING', 'REJECTED', $4, $5, NULL)`,
      [
        randomUUID(),
        applicationId,
        userId,
        "The application cannot proceed in this review slice.",
        "migration-review-request",
      ]
    );

    await expect(
      client.query(
        `INSERT INTO "CreatorApplicationReviewEvent"
          ("id", "creatorApplicationId", "reviewerUserId", "fromStatus", "toStatus", "reason", "requestId", "requestIp")
         VALUES ($1, $2, $3, 'REJECTED', 'NEEDS_INFORMATION', $4, $5, NULL)`,
        [
          randomUUID(),
          applicationId,
          userId,
          "This transition must fail the database constraint.",
          "migration-invalid-transition",
        ]
      )
    ).rejects.toMatchObject({ code: "23514" });

    for (const [index, reason] of [
      "\t".repeat(10),
      "\n".repeat(10),
      "\tThis reason starts with whitespace.",
      "This reason ends with whitespace.\n",
      "\u00a0This reason starts with a no-break space.",
      "This reason ends with a narrow no-break space.\u202f",
      "\ufeffThis reason starts with a byte-order mark.",
    ].entries()) {
      await expect(
        client.query(
          `INSERT INTO "CreatorApplicationReviewEvent"
            ("id", "creatorApplicationId", "reviewerUserId", "fromStatus", "toStatus", "reason", "requestId", "requestIp")
           VALUES ($1, $2, $3, 'PENDING', 'REJECTED', $4, $5, NULL)`,
          [
            randomUUID(),
            applicationId,
            userId,
            reason,
            `migration-invalid-reason-${index}`,
          ]
        )
      ).rejects.toMatchObject({ code: "23514" });
    }
  });
});
