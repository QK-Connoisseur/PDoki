import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PREREQUISITE_MIGRATIONS = [
  "20260706204710_init",
  "20260716211419_add_core_auth",
  "20260727104556_add_verification_tokens",
  "20260801103000_add_user_preferences",
  "20260801221000_add_creator_applications",
  "20260802100000_add_creator_application_review_events",
] as const;
const OPERATIONS_ACCESS_MIGRATION =
  "20260823120000_add_operations_operator_access";

let client: Client;
let schemaName: string;
let schemaCreated = false;

function loadDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    const rootEnv = fileURLToPath(new URL("../../../../.env", import.meta.url));
    if (existsSync(rootEnv)) loadEnvFile(rootEnv);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for operations mapping migration coverage"
    );
  }
  return process.env.DATABASE_URL;
}

async function migrationSql(migration: string): Promise<string> {
  const path = fileURLToPath(
    new URL(
      `../../../../packages/database/prisma/migrations/${migration}/migration.sql`,
      import.meta.url
    )
  );
  return readFile(path, "utf8");
}

async function insertAdmin(userId: string, label: string): Promise<void> {
  await client.query(
    `INSERT INTO "User"
      ("id", "email", "passwordHash", "displayName", "role", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      userId,
      `${label}@operations-migration.pumdoki.example`,
      "migration-test-hash",
      `Operator ${label}`,
    ]
  );
}

beforeAll(async () => {
  client = new Client({ connectionString: loadDatabaseUrl() });
  await client.connect();
  schemaName = `operations_access_${randomUUID().replaceAll("-", "_")}`;
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  schemaCreated = true;
  await client.query(`SET search_path TO "${schemaName}"`);

  for (const migration of PREREQUISITE_MIGRATIONS) {
    await client.query(await migrationSql(migration));
  }
});

afterAll(async () => {
  if (!client) return;
  if (schemaCreated) {
    await client.query("SET search_path TO public");
    await client.query(`DROP SCHEMA "${schemaName}" CASCADE`);
  }
  await client.end();
});

describe("operations operator provisioning migration", () => {
  it("adds exact, non-reassignable operator mappings without changing existing users", async () => {
    const firstUserId = randomUUID();
    const secondUserId = randomUUID();
    const operatorId = randomUUID();
    await insertAdmin(firstUserId, "first");
    await insertAdmin(secondUserId, "second");

    await client.query(await migrationSql(OPERATIONS_ACCESS_MIGRATION));

    const publicFunctionPrivileges = await client.query<{ count: number }>(`
      SELECT count(*)::integer AS count
      FROM information_schema.routine_privileges
      WHERE routine_schema = current_schema()
        AND routine_name IN (
          'enforce_operations_operator_history',
          'enforce_operations_permission_grant_history'
        )
        AND grantee = 'PUBLIC'
        AND privilege_type = 'EXECUTE'
    `);
    expect(publicFunctionPrivileges.rows).toEqual([{ count: 0 }]);

    const usersBeforeProvisioning = await client.query<{ count: number }>(
      `SELECT count(*)::integer AS count FROM "User"`
    );
    expect(usersBeforeProvisioning.rows).toEqual([{ count: 2 }]);

    await client.query(
      `INSERT INTO "OperationsOperator"
        ("id", "issuer", "subject", "userId")
       VALUES ($1, $2, $3, $4)`,
      [
        operatorId,
        "https://identity.operations.pumdoki.example",
        "opaque-operator-subject",
        firstUserId,
      ]
    );

    await expect(
      client.query(
        `INSERT INTO "OperationsOperator"
          ("id", "issuer", "subject", "userId")
         VALUES ($1, $2, $3, $4)`,
        [
          randomUUID(),
          "https://identity.operations.pumdoki.example",
          "opaque-operator-subject",
          secondUserId,
        ]
      )
    ).rejects.toMatchObject({ code: "23505" });

    for (const [issuer, subject] of [
      [" https://identity.operations.pumdoki.example", "another-subject"],
      ["https://identity.operations.pumdoki.example", " padded-subject"],
      ["https://identity.operations.pumdoki.example", "subject-with-tail\n"],
    ]) {
      await expect(
        client.query(
          `INSERT INTO "OperationsOperator"
            ("id", "issuer", "subject", "userId")
           VALUES ($1, $2, $3, $4)`,
          [randomUUID(), issuer, subject, secondUserId]
        )
      ).rejects.toMatchObject({ code: "23514" });
    }

    for (const [column, value] of [
      ["issuer", "https://replacement.operations.pumdoki.example"],
      ["subject", "replacement-subject"],
      ["userId", secondUserId],
    ] as const) {
      await expect(
        client.query(
          `UPDATE "OperationsOperator" SET "${column}" = $1 WHERE "id" = $2`,
          [value, operatorId]
        )
      ).rejects.toMatchObject({ code: "23514" });
    }

    const persisted = await client.query<{
      disabledAt: Date | null;
      issuer: string;
      subject: string;
      userId: string;
    }>(
      `SELECT "issuer", "subject", "userId", "disabledAt"
         FROM "OperationsOperator" WHERE "id" = $1`,
      [operatorId]
    );
    expect(persisted.rows).toEqual([
      {
        issuer: "https://identity.operations.pumdoki.example",
        subject: "opaque-operator-subject",
        userId: firstUserId,
        disabledAt: null,
      },
    ]);
  });

  it("retains grant and disablement history with one active grant at a time", async () => {
    const userId = randomUUID();
    const operatorId = randomUUID();
    const firstGrantId = randomUUID();
    const secondGrantId = randomUUID();
    await insertAdmin(userId, "history");
    await client.query(
      `INSERT INTO "OperationsOperator"
        ("id", "issuer", "subject", "userId")
       VALUES ($1, $2, $3, $4)`,
      [
        operatorId,
        "https://identity.operations.pumdoki.example",
        "history-subject",
        userId,
      ]
    );
    await client.query(
      `INSERT INTO "OperationsPermissionGrant"
        ("id", "operatorId", "permission")
       VALUES ($1, $2, 'creator_applications.review')`,
      [firstGrantId, operatorId]
    );

    await expect(
      client.query(
        `INSERT INTO "OperationsPermissionGrant"
          ("id", "operatorId", "permission")
         VALUES ($1, $2, 'creator_applications.review')`,
        [randomUUID(), operatorId]
      )
    ).rejects.toMatchObject({ code: "23505" });

    const revokedAt = new Date(Date.now() + 1_000);
    await client.query(
      `UPDATE "OperationsPermissionGrant" SET "revokedAt" = $1 WHERE "id" = $2`,
      [revokedAt, firstGrantId]
    );
    await client.query(
      `INSERT INTO "OperationsPermissionGrant"
        ("id", "operatorId", "permission")
       VALUES ($1, $2, 'creator_applications.review')`,
      [secondGrantId, operatorId]
    );

    for (const replacement of [null, new Date(revokedAt.getTime() + 1_000)]) {
      await expect(
        client.query(
          `UPDATE "OperationsPermissionGrant" SET "revokedAt" = $1 WHERE "id" = $2`,
          [replacement, firstGrantId]
        )
      ).rejects.toMatchObject({ code: "23514" });
    }

    const disabledAt = new Date(Date.now() + 2_000);
    await client.query(
      `UPDATE "OperationsOperator" SET "disabledAt" = $1 WHERE "id" = $2`,
      [disabledAt, operatorId]
    );
    for (const replacement of [null, new Date(disabledAt.getTime() + 1_000)]) {
      await expect(
        client.query(
          `UPDATE "OperationsOperator" SET "disabledAt" = $1 WHERE "id" = $2`,
          [replacement, operatorId]
        )
      ).rejects.toMatchObject({ code: "23514" });
    }

    await expect(
      client.query(`DELETE FROM "OperationsOperator" WHERE "id" = $1`, [
        operatorId,
      ])
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      client.query(`DELETE FROM "OperationsPermissionGrant" WHERE "id" = $1`, [
        firstGrantId,
      ])
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      client.query(`TRUNCATE TABLE "OperationsPermissionGrant"`)
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      client.query(`TRUNCATE TABLE "OperationsOperator" CASCADE`)
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      client.query(`DELETE FROM "User" WHERE "id" = $1`, [userId])
    ).rejects.toMatchObject({ code: "23503" });

    const grants = await client.query<{
      id: string;
      revokedAt: Date | null;
    }>(
      `SELECT "id", "revokedAt" FROM "OperationsPermissionGrant"
       WHERE "operatorId" = $1 ORDER BY "grantedAt", "id"`,
      [operatorId]
    );
    expect(grants.rows).toHaveLength(2);
    expect(
      grants.rows.find(({ id }) => id === firstGrantId)?.revokedAt
    ).toEqual(revokedAt);
    expect(grants.rows.find(({ id }) => id === secondGrantId)?.revokedAt).toBe(
      null
    );
  });
});
