import { randomBytes, randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { isIP } from "node:net";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaClient } from "@pumdoki/database";
import { Client, type QueryConfigValues } from "pg";
import { describe, expect, it } from "vitest";
import {
  hashPhase2CanaryIdempotencyKey,
  submitPhase2Canary,
} from "./enqueue.js";

/**
 * This proof deliberately stays opt-in because it creates cluster roles and an
 * isolated database. It refuses anything except the exact local/CI PostgreSQL
 * 17 development bootstrap before issuing DDL. Run from the repository root:
 *
 * PUMDOKI_RUN_WORKER_PRIVILEGE_TEST=1 npm run test --workspace @pumdoki/api -- src/durableJobs/privileges.integration.test.ts
 */
const enabled = process.env.PUMDOKI_RUN_WORKER_PRIVILEGE_TEST === "1";
const expectedDatabase = "pumdoki_dev";
const expectedRole = "pumdoki";

const workerRoutines = [
  "job_queue.claim_one(uuid)",
  "job_queue.renew_job(uuid,uuid)",
  "job_queue.release_unstarted_job(uuid,uuid)",
  "job_queue.complete_job(uuid,uuid)",
  "job_queue.fail_job(uuid,uuid,text)",
  "job_queue.record_phase2_canary_effect(uuid,uuid)",
  "job_queue.queue_stats()",
] as const;
const enqueueRoutine =
  "job_queue.enqueue_phase2_canary(uuid,uuid,text,text,text)";

interface Fixture {
  bootstrapUrl: string;
  bootstrap?: Client;
  owner?: Client;
  verifier?: Client;
  api?: Client;
  apiPrisma?: PrismaClient;
  worker?: Client;
  databaseCleanupRegistered: boolean;
  roleCleanupTargets: string[];
  database: string;
  ownerRole: string;
  apiRole: string;
  workerRole: string;
}

interface PrivilegeRow {
  databaseConnect: boolean;
  databaseCreate: boolean;
  databaseTemporary: boolean;
  publicUsage: boolean;
  publicCreate: boolean;
  queueUsage: boolean;
  queueCreate: boolean;
}

function quoteIdentifier(value: string): string {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(value)) {
    throw new Error("Generated PostgreSQL identifier is unsafe");
  }
  return `"${value}"`;
}

function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function loadBootstrapUrl(): string {
  if (!process.env.DATABASE_URL) {
    const rootEnv = fileURLToPath(new URL("../../../../.env", import.meta.url));
    if (existsSync(rootEnv)) loadEnvFile(rootEnv);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for the opt-in worker privilege proof"
    );
  }
  return process.env.DATABASE_URL;
}

function isLoopback(address: string): boolean {
  return (
    address === "::1" ||
    address.startsWith("127.") ||
    address.startsWith("::ffff:127.")
  );
}

async function assertSafeBootstrapTarget(connectionString: string) {
  const parsed = new URL(connectionString);
  const hostname = parsed.hostname.replace(/^\[|\]$/g, "");
  const database = decodeURIComponent(parsed.pathname.slice(1));
  const username = decodeURIComponent(parsed.username);
  const port = Number(parsed.port || "5432");

  if (
    !["postgres:", "postgresql:"].includes(parsed.protocol) ||
    parsed.search.length > 0 ||
    parsed.hash.length > 0 ||
    database !== expectedDatabase ||
    username !== expectedRole ||
    port !== 5432 ||
    !["localhost", "127.0.0.1", "::1"].includes(hostname)
  ) {
    throw new Error(
      "Worker privilege proof refused a non-local or unexpected bootstrap target"
    );
  }

  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => !isLoopback(address))
  ) {
    throw new Error(
      "Worker privilege proof requires loopback-only DNS results"
    );
  }

  return { parsed, database, username, port };
}

function connectionFor(
  bootstrap: URL,
  database: string,
  username: string,
  password: string
): string {
  const target = new URL(bootstrap);
  target.pathname = `/${database}`;
  target.username = username;
  target.password = password;
  return target.toString();
}

async function connectDirect(connectionString: string): Promise<Client> {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 3_000,
    statement_timeout: 10_000,
  });
  await client.connect();
  return client;
}

async function expectDenied(
  client: Client,
  sql: string,
  values?: QueryConfigValues
): Promise<void> {
  await expect(client.query(sql, values)).rejects.toMatchObject({
    code: "42501",
  });
}

async function readProductionMigration(): Promise<string> {
  return readFile(
    new URL(
      "../../../../packages/database/prisma/migrations/20260820140000_add_durable_worker_foundation/migration.sql",
      import.meta.url
    ),
    "utf8"
  );
}

async function cleanupFixture(fixture: Fixture): Promise<void> {
  const errors: unknown[] = [];
  const close = async (client: Client | undefined): Promise<void> => {
    if (!client) return;
    try {
      await client.end();
    } catch (error) {
      errors.push(error);
    }
  };

  if (fixture.apiPrisma) {
    try {
      await fixture.apiPrisma.$disconnect();
    } catch (error) {
      errors.push(error);
    }
  }
  await close(fixture.api);
  await close(fixture.worker);
  await close(fixture.owner);
  await close(fixture.verifier);

  let admin = fixture.bootstrap;
  if (admin) {
    try {
      await admin.query("SELECT 1");
    } catch (error) {
      errors.push(error);
      await close(admin);
      admin = undefined;
    }
  }
  if (
    !admin &&
    (fixture.databaseCleanupRegistered || fixture.roleCleanupTargets.length)
  ) {
    try {
      admin = await connectDirect(fixture.bootstrapUrl);
    } catch (error) {
      errors.push(error);
    }
  }

  if (admin) {
    const attempt = async (action: () => Promise<unknown>): Promise<void> => {
      try {
        await action();
      } catch (error) {
        errors.push(error);
      }
    };
    try {
      await attempt(() => admin!.query("SET lock_timeout = '2s'"));
      await attempt(() => admin!.query("SET statement_timeout = '12s'"));
      if (fixture.databaseCleanupRegistered) {
        await attempt(() =>
          admin!.query(
            `SELECT pg_catalog.pg_terminate_backend(activity.pid)
               FROM pg_catalog.pg_stat_activity AS activity
              WHERE activity.datname = $1
                AND activity.pid <> pg_catalog.pg_backend_pid()`,
            [fixture.database]
          )
        );
        await attempt(() =>
          admin!.query(
            `DROP DATABASE IF EXISTS ${quoteIdentifier(fixture.database)} WITH (FORCE)`
          )
        );
      }
      for (const role of [...fixture.roleCleanupTargets].reverse()) {
        await attempt(async () => {
          const existing = await admin!.query<{ exists: boolean }>(
            `SELECT pg_catalog.count(*) = 1 AS exists
               FROM pg_catalog.pg_roles
              WHERE rolname = $1`,
            [role]
          );
          if (existing.rows[0]?.exists !== true) return;
          await admin!.query(`DROP OWNED BY ${quoteIdentifier(role)}`);
          await admin!.query(`DROP ROLE ${quoteIdentifier(role)}`);
        });
      }

      await attempt(async () => {
        const remnants = await admin!.query<{
          databases: number;
          roles: number;
        }>(
          `SELECT
             (
               SELECT pg_catalog.count(*)::integer
                 FROM pg_catalog.pg_database
                WHERE datname = $1
             ) AS databases,
             (
               SELECT pg_catalog.count(*)::integer
                 FROM pg_catalog.pg_roles
                WHERE rolname = ANY($2::text[])
             ) AS roles`,
          [fixture.database, fixture.roleCleanupTargets]
        );
        if (
          remnants.rows[0]?.databases !== 0 ||
          remnants.rows[0]?.roles !== 0
        ) {
          throw new Error(
            "Worker privilege proof left a temporary database or role"
          );
        }
      });
    } catch (error) {
      errors.push(error);
    } finally {
      await close(admin);
    }
  } else if (
    fixture.databaseCleanupRegistered ||
    fixture.roleCleanupTargets.length
  ) {
    errors.push(
      new Error("Worker privilege proof could not obtain a cleanup connection")
    );
  }

  if (errors.length) {
    throw new AggregateError(
      errors,
      "Worker privilege proof could not clean every temporary resource"
    );
  }
}

describe.sequential("durable worker production privilege boundary", () => {
  it.runIf(enabled)(
    "authenticates separate API and worker roles with only allowlisted rights",
    async () => {
      const suffix = randomBytes(6).toString("hex");
      const bootstrapUrl = loadBootstrapUrl();
      const fixture: Fixture = {
        bootstrapUrl,
        databaseCleanupRegistered: false,
        roleCleanupTargets: [],
        database: `p2_worker_priv_${suffix}`,
        ownerRole: `p2_worker_owner_${suffix}`,
        apiRole: `p2_worker_api_${suffix}`,
        workerRole: `p2_worker_runtime_${suffix}`,
      };
      const ownerPassword = randomBytes(24).toString("base64url");
      const apiPassword = randomBytes(24).toString("base64url");
      const workerPassword = randomBytes(24).toString("base64url");

      try {
        const safeTarget = await assertSafeBootstrapTarget(bootstrapUrl);
        fixture.bootstrap = await connectDirect(bootstrapUrl);
        const server = await fixture.bootstrap.query<{
          currentDatabase: string;
          currentUser: string;
          serverPort: number;
          serverVersionNum: string;
          superuser: boolean;
          inRecovery: boolean;
        }>(`
          SELECT
            pg_catalog.current_database() AS "currentDatabase",
            current_user AS "currentUser",
            pg_catalog.inet_server_port() AS "serverPort",
            pg_catalog.current_setting('server_version_num') AS "serverVersionNum",
            role.rolsuper AS superuser,
            pg_catalog.pg_is_in_recovery() AS "inRecovery"
          FROM pg_catalog.pg_roles AS role
          WHERE role.rolname = current_user
        `);
        expect(server.rows).toEqual([
          {
            currentDatabase: safeTarget.database,
            currentUser: safeTarget.username,
            serverPort: safeTarget.port,
            serverVersionNum: expect.stringMatching(/^17\d{4}$/),
            superuser: true,
            inRecovery: false,
          },
        ]);

        const targetConflicts = await fixture.bootstrap.query<{
          databases: number;
          roles: number;
        }>(
          `SELECT
             (
               SELECT pg_catalog.count(*)::integer
                 FROM pg_catalog.pg_database
                WHERE datname = $1
             ) AS databases,
             (
               SELECT pg_catalog.count(*)::integer
                 FROM pg_catalog.pg_roles
                WHERE rolname = ANY($2::text[])
             ) AS roles`,
          [
            fixture.database,
            [fixture.ownerRole, fixture.apiRole, fixture.workerRole],
          ]
        );
        if (
          targetConflicts.rows[0]?.databases !== 0 ||
          targetConflicts.rows[0]?.roles !== 0
        ) {
          throw new Error(
            "Worker privilege proof generated a conflicting cleanup target"
          );
        }
        fixture.databaseCleanupRegistered = true;
        fixture.roleCleanupTargets.push(
          fixture.ownerRole,
          fixture.apiRole,
          fixture.workerRole
        );

        for (const { role, password } of [
          { role: fixture.ownerRole, password: ownerPassword },
          { role: fixture.apiRole, password: apiPassword },
          { role: fixture.workerRole, password: workerPassword },
        ]) {
          await fixture.bootstrap.query(`CREATE ROLE ${quoteIdentifier(role)}
            LOGIN PASSWORD ${quoteLiteral(password)}
            NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE
            NOREPLICATION NOBYPASSRLS`);
        }

        await fixture.bootstrap.query(
          `CREATE DATABASE ${quoteIdentifier(fixture.database)}
             OWNER ${quoteIdentifier(fixture.ownerRole)}
             TEMPLATE template0 ENCODING 'UTF8'`
        );

        fixture.owner = await connectDirect(
          connectionFor(
            safeTarget.parsed,
            fixture.database,
            fixture.ownerRole,
            ownerPassword
          )
        );
        const ownerSession = await fixture.owner.query<{
          currentUser: string;
          sessionUser: string;
          superuser: boolean;
        }>(`
          SELECT current_user AS "currentUser",
                 session_user AS "sessionUser",
                 role.rolsuper AS superuser
            FROM pg_catalog.pg_roles AS role
           WHERE role.rolname = current_user
        `);
        expect(ownerSession.rows).toEqual([
          {
            currentUser: fixture.ownerRole,
            sessionUser: fixture.ownerRole,
            superuser: false,
          },
        ]);

        await fixture.owner.query(await readProductionMigration());
        const queuePublicPrivileges = await fixture.owner.query<{
          create: boolean;
          usage: boolean;
        }>(`
          SELECT
            pg_catalog.bool_or(
              privilege.grantee = 0
              AND privilege.privilege_type = 'CREATE'
            ) AS create,
            pg_catalog.bool_or(
              privilege.grantee = 0
              AND privilege.privilege_type = 'USAGE'
            ) AS usage
          FROM pg_catalog.pg_namespace AS namespace
          CROSS JOIN LATERAL pg_catalog.aclexplode(
            COALESCE(
              namespace.nspacl,
              pg_catalog.acldefault('n', namespace.nspowner)
            )
          ) AS privilege
          WHERE namespace.nspname = 'job_queue'
        `);
        expect(queuePublicPrivileges.rows).toEqual([
          { create: false, usage: false },
        ]);
        await fixture.owner.query(
          `REVOKE ALL ON DATABASE ${quoteIdentifier(fixture.database)} FROM PUBLIC`
        );
        await fixture.owner.query("REVOKE ALL ON SCHEMA public FROM PUBLIC");
        await fixture.owner.query(
          `GRANT CONNECT ON DATABASE ${quoteIdentifier(fixture.database)}
             TO ${quoteIdentifier(fixture.apiRole)}, ${quoteIdentifier(fixture.workerRole)}`
        );
        await fixture.owner.query(
          `GRANT USAGE ON SCHEMA public, job_queue TO ${quoteIdentifier(fixture.apiRole)}`
        );
        await fixture.owner.query(
          `GRANT USAGE ON SCHEMA job_queue TO ${quoteIdentifier(fixture.workerRole)}`
        );
        await fixture.owner.query(
          `GRANT
             SELECT ("id", "idempotencyKeyHash", "requestDigest", "requestId", "createdAt"),
             INSERT ("id", "idempotencyKeyHash", "requestDigest", "requestId", "createdAt")
           ON TABLE public."WorkerCanaryIntent"
           TO ${quoteIdentifier(fixture.apiRole)}`
        );
        await fixture.owner.query(
          `GRANT SELECT ("jobId", "canaryIntentId")
           ON TABLE public."WorkerCanaryJob"
           TO ${quoteIdentifier(fixture.apiRole)}`
        );
        await fixture.owner.query(
          `GRANT SELECT ("id", "originalJobId", "replaySequence")
           ON TABLE public."DurableJob"
           TO ${quoteIdentifier(fixture.apiRole)}`
        );
        await fixture.owner.query(
          `GRANT EXECUTE ON FUNCTION ${enqueueRoutine}
             TO ${quoteIdentifier(fixture.apiRole)}`
        );
        for (const routine of workerRoutines) {
          await fixture.owner.query(
            `GRANT EXECUTE ON FUNCTION ${routine}
               TO ${quoteIdentifier(fixture.workerRole)}`
          );
        }
        await fixture.owner.end();
        fixture.owner = undefined;
        await fixture.bootstrap.query(
          `ALTER ROLE ${quoteIdentifier(fixture.ownerRole)} NOLOGIN PASSWORD NULL`
        );

        const verifierUrl = new URL(bootstrapUrl);
        verifierUrl.pathname = `/${fixture.database}`;
        fixture.verifier = await connectDirect(verifierUrl.toString());

        const apiConnectionString = connectionFor(
          safeTarget.parsed,
          fixture.database,
          fixture.apiRole,
          apiPassword
        );
        fixture.api = await connectDirect(apiConnectionString);
        const { PrismaClient: IsolatedPrismaClient } =
          await import("../../../../packages/database/src/generated/prisma/client.js");
        fixture.apiPrisma = new IsolatedPrismaClient({
          adapter: new PrismaPg({ connectionString: apiConnectionString }),
        });
        await fixture.apiPrisma.$connect();
        fixture.worker = await connectDirect(
          connectionFor(
            safeTarget.parsed,
            fixture.database,
            fixture.workerRole,
            workerPassword
          )
        );

        for (const [client, role] of [
          [fixture.api, fixture.apiRole],
          [fixture.worker, fixture.workerRole],
        ] as const) {
          const identity = await client.query<{
            currentUser: string;
            sessionUser: string;
          }>(
            `SELECT current_user AS "currentUser",
                    session_user AS "sessionUser"`
          );
          expect(identity.rows).toEqual([
            { currentUser: role, sessionUser: role },
          ]);
        }

        const roleAttributes = await fixture.bootstrap.query<{
          role: string;
          canLogin: boolean;
          inherit: boolean;
          superuser: boolean;
          createDatabase: boolean;
          createRole: boolean;
          replication: boolean;
          bypassRls: boolean;
        }>(
          `SELECT
             rolname AS role,
             rolcanlogin AS "canLogin",
             rolinherit AS inherit,
             rolsuper AS superuser,
             rolcreatedb AS "createDatabase",
             rolcreaterole AS "createRole",
             rolreplication AS replication,
             rolbypassrls AS "bypassRls"
           FROM pg_catalog.pg_roles
           WHERE rolname = ANY($1::text[])
           ORDER BY rolname`,
          [[fixture.ownerRole, fixture.apiRole, fixture.workerRole]]
        );
        expect(roleAttributes.rows).toHaveLength(3);
        for (const role of roleAttributes.rows) {
          expect(role).toMatchObject({
            canLogin: role.role !== fixture.ownerRole,
            inherit: false,
            superuser: false,
            createDatabase: false,
            createRole: false,
            replication: false,
            bypassRls: false,
          });
        }

        const objectOwners = await fixture.verifier.query<{ owner: string }>(
          `SELECT pg_catalog.pg_get_userbyid(class.relowner) AS owner
             FROM pg_catalog.pg_class AS class
             JOIN pg_catalog.pg_namespace AS namespace
               ON namespace.oid = class.relnamespace
            WHERE namespace.nspname = 'public'
              AND class.relname = ANY($1::text[])
           UNION ALL
           SELECT pg_catalog.pg_get_userbyid(proc.proowner) AS owner
             FROM pg_catalog.pg_proc AS proc
             JOIN pg_catalog.pg_namespace AS namespace
               ON namespace.oid = proc.pronamespace
            WHERE namespace.nspname = 'job_queue'`,
          [
            [
              "DurableJob",
              "WorkerCanaryIntent",
              "WorkerCanaryJob",
              "WorkerCanaryEffect",
            ],
          ]
        );
        expect(objectOwners.rows).toHaveLength(12);
        expect(new Set(objectOwners.rows.map(({ owner }) => owner))).toEqual(
          new Set([fixture.ownerRole])
        );

        const privilegeRows = await fixture.verifier.query<
          PrivilegeRow & { role: string }
        >(
          `SELECT
             candidate.role,
             pg_catalog.has_database_privilege(candidate.role, $2, 'CONNECT') AS "databaseConnect",
             pg_catalog.has_database_privilege(candidate.role, $2, 'CREATE') AS "databaseCreate",
             pg_catalog.has_database_privilege(candidate.role, $2, 'TEMPORARY') AS "databaseTemporary",
             pg_catalog.has_schema_privilege(candidate.role, 'public', 'USAGE') AS "publicUsage",
             pg_catalog.has_schema_privilege(candidate.role, 'public', 'CREATE') AS "publicCreate",
             pg_catalog.has_schema_privilege(candidate.role, 'job_queue', 'USAGE') AS "queueUsage",
             pg_catalog.has_schema_privilege(candidate.role, 'job_queue', 'CREATE') AS "queueCreate"
           FROM unnest($1::text[]) AS candidate(role)
           ORDER BY candidate.role`,
          [[fixture.apiRole, fixture.workerRole], fixture.database]
        );
        expect(privilegeRows.rows).toEqual(
          [
            {
              role: fixture.apiRole,
              databaseConnect: true,
              databaseCreate: false,
              databaseTemporary: false,
              publicUsage: true,
              publicCreate: false,
              queueUsage: true,
              queueCreate: false,
            },
            {
              role: fixture.workerRole,
              databaseConnect: true,
              databaseCreate: false,
              databaseTemporary: false,
              publicUsage: false,
              publicCreate: false,
              queueUsage: true,
              queueCreate: false,
            },
          ].sort((left, right) => left.role.localeCompare(right.role))
        );

        const functionPrivileges = await fixture.verifier.query<{
          role: string;
          routine: string;
          execute: boolean;
        }>(
          `SELECT candidate.role,
                  routine.name AS routine,
                  pg_catalog.has_function_privilege(
                    candidate.role,
                    pg_catalog.to_regprocedure(routine.name),
                    'EXECUTE'
                  ) AS execute
             FROM unnest($1::text[]) AS candidate(role)
            CROSS JOIN unnest($2::text[]) AS routine(name)
            ORDER BY candidate.role, routine.name`,
          [
            [fixture.apiRole, fixture.workerRole],
            [enqueueRoutine, ...workerRoutines],
          ]
        );
        for (const privilege of functionPrivileges.rows) {
          expect(privilege.execute).toBe(
            privilege.role === fixture.apiRole
              ? privilege.routine === enqueueRoutine
              : privilege.routine !== enqueueRoutine
          );
        }

        const columnPrivileges = await fixture.verifier.query<{
          columnName: string;
          privilege: string;
          tableName: string;
        }>(
          `SELECT table_name AS "tableName",
                  column_name AS "columnName",
                  privilege_type AS privilege
             FROM information_schema.column_privileges
            WHERE grantee = $1
              AND table_schema = 'public'
            ORDER BY table_name, column_name, privilege_type`,
          [fixture.apiRole]
        );
        expect(
          columnPrivileges.rows.map(
            ({ tableName, columnName, privilege }) =>
              `${tableName}.${columnName}:${privilege}`
          )
        ).toEqual([
          "DurableJob.id:SELECT",
          "DurableJob.originalJobId:SELECT",
          "DurableJob.replaySequence:SELECT",
          "WorkerCanaryIntent.createdAt:INSERT",
          "WorkerCanaryIntent.createdAt:SELECT",
          "WorkerCanaryIntent.id:INSERT",
          "WorkerCanaryIntent.id:SELECT",
          "WorkerCanaryIntent.idempotencyKeyHash:INSERT",
          "WorkerCanaryIntent.idempotencyKeyHash:SELECT",
          "WorkerCanaryIntent.requestDigest:INSERT",
          "WorkerCanaryIntent.requestDigest:SELECT",
          "WorkerCanaryIntent.requestId:INSERT",
          "WorkerCanaryIntent.requestId:SELECT",
          "WorkerCanaryJob.canaryIntentId:SELECT",
          "WorkerCanaryJob.jobId:SELECT",
        ]);
        const workerColumns = await fixture.verifier.query<{ count: number }>(
          `SELECT pg_catalog.count(*)::integer AS count
             FROM information_schema.column_privileges
            WHERE grantee = $1
              AND table_schema = 'public'`,
          [fixture.workerRole]
        );
        expect(workerColumns.rows).toEqual([{ count: 0 }]);

        for (const client of [fixture.api, fixture.worker]) {
          await expectDenied(
            client,
            `SET ROLE ${quoteIdentifier(fixture.ownerRole)}`
          );
          await expectDenied(
            client,
            `SET ROLE ${quoteIdentifier(safeTarget.username)}`
          );
          await expectDenied(
            client,
            `SET SESSION AUTHORIZATION ${quoteIdentifier(fixture.ownerRole)}`
          );
          await expectDenied(
            client,
            "CREATE TEMP TABLE forbidden_temp (id int)"
          );
          await expectDenied(
            client,
            "CREATE TABLE public.forbidden_ddl (id int)"
          );
          await expectDenied(
            client,
            "CREATE TABLE job_queue.forbidden_ddl (id int)"
          );
        }

        const requestId = `privilege-${suffix}`;
        const canaryInput = {
          idempotencyKey: `privilege-canary-${suffix}`,
          requestDigest: "a".repeat(64),
          requestId,
          correlationId: null,
        };
        const submitted = await submitPhase2Canary(
          fixture.apiPrisma,
          canaryInput
        );
        expect(submitted.replayed).toBe(false);
        await expect(
          submitPhase2Canary(fixture.apiPrisma, canaryInput)
        ).resolves.toEqual({ ...submitted, replayed: true });
        const { canaryIntentId, jobId } = submitted;
        await expect(
          fixture.api.query(
            `SELECT "jobId", "canaryIntentId"
               FROM public."WorkerCanaryJob"
              WHERE "jobId" = $1::uuid`,
            [jobId]
          )
        ).resolves.toMatchObject({
          rows: [{ jobId, canaryIntentId }],
        });
        await expect(
          fixture.api.query(
            `SELECT "id", "originalJobId", "replaySequence"
               FROM public."DurableJob"
              WHERE "id" = $1::uuid`,
            [jobId]
          )
        ).resolves.toMatchObject({
          rows: [{ id: jobId, originalJobId: null, replaySequence: 0 }],
        });
        await expectDenied(
          fixture.api,
          `SELECT "payload" FROM public."DurableJob" WHERE "id" = $1::uuid`,
          [jobId]
        );
        await expectDenied(
          fixture.api,
          `UPDATE public."DurableJob" SET "availableAt" = CURRENT_TIMESTAMP
            WHERE "id" = $1::uuid`,
          [jobId]
        );
        await expectDenied(
          fixture.api,
          `INSERT INTO public."WorkerCanaryJob" ("jobId", "canaryIntentId")
           VALUES ($1::uuid, $2::uuid)`,
          [randomUUID(), canaryIntentId]
        );
        await expectDenied(
          fixture.api,
          `DELETE FROM public."WorkerCanaryJob" WHERE "jobId" = $1::uuid`,
          [jobId]
        );
        await expectDenied(fixture.api, `TRUNCATE public."DurableJob"`);

        const deniedApiWorkerCalls: Array<{
          sql: string;
          values: QueryConfigValues;
        }> = [
          {
            sql: "SELECT * FROM job_queue.claim_one($1::uuid)",
            values: [randomUUID()],
          },
          {
            sql: "SELECT job_queue.renew_job($1::uuid, $2::uuid)",
            values: [jobId, randomUUID()],
          },
          {
            sql: "SELECT job_queue.release_unstarted_job($1::uuid, $2::uuid)",
            values: [jobId, randomUUID()],
          },
          {
            sql: "SELECT job_queue.complete_job($1::uuid, $2::uuid)",
            values: [jobId, randomUUID()],
          },
          {
            sql: "SELECT * FROM job_queue.fail_job($1::uuid, $2::uuid, $3::text)",
            values: [jobId, randomUUID(), "TRANSIENT"],
          },
          {
            sql: "SELECT * FROM job_queue.record_phase2_canary_effect($1::uuid, $2::uuid)",
            values: [jobId, randomUUID()],
          },
          {
            sql: "SELECT * FROM job_queue.queue_stats()",
            values: [],
          },
        ];
        for (const call of deniedApiWorkerCalls) {
          await expectDenied(fixture.api, call.sql, call.values);
        }

        const firstToken = randomUUID();
        const firstClaim = await fixture.worker.query<{
          job_id: string;
          attempt_count: number;
        }>("SELECT * FROM job_queue.claim_one($1::uuid)", [firstToken]);
        expect(firstClaim.rows).toMatchObject([
          { job_id: jobId, attempt_count: 1 },
        ]);
        await expect(
          fixture.worker.query(
            "SELECT job_queue.renew_job($1::uuid, $2::uuid) AS accepted",
            [jobId, firstToken]
          )
        ).resolves.toMatchObject({ rows: [{ accepted: true }] });
        await expect(
          fixture.worker.query(
            "SELECT job_queue.release_unstarted_job($1::uuid, $2::uuid) AS accepted",
            [jobId, firstToken]
          )
        ).resolves.toMatchObject({ rows: [{ accepted: true }] });

        const secondToken = randomUUID();
        await expect(
          fixture.worker.query("SELECT * FROM job_queue.claim_one($1::uuid)", [
            secondToken,
          ])
        ).resolves.toMatchObject({ rows: [{ job_id: jobId }] });
        await expect(
          fixture.worker.query(
            "SELECT * FROM job_queue.record_phase2_canary_effect($1::uuid, $2::uuid)",
            [jobId, secondToken]
          )
        ).resolves.toMatchObject({
          rows: [{ accepted: true, effect_created: true }],
        });
        await expect(
          fixture.worker.query(
            "SELECT job_queue.complete_job($1::uuid, $2::uuid) AS accepted",
            [jobId, secondToken]
          )
        ).resolves.toMatchObject({ rows: [{ accepted: true }] });
        await expect(
          fixture.worker.query("SELECT * FROM job_queue.queue_stats()")
        ).resolves.toMatchObject({
          rows: [
            expect.objectContaining({
              available_jobs: "0",
              running_jobs: "0",
              succeeded_jobs: "1",
            }),
          ],
        });

        const deadIntentId = randomUUID();
        const deadJobId = randomUUID();
        const deadKeyHash = hashPhase2CanaryIdempotencyKey(
          `privilege-dead-${suffix}`
        );
        await fixture.api.query(
          `INSERT INTO public."WorkerCanaryIntent" (
             "id", "idempotencyKeyHash", "requestDigest", "requestId"
           ) VALUES ($1::uuid, $2, $3, $4)`,
          [deadIntentId, deadKeyHash, "b".repeat(64), requestId]
        );
        await fixture.api.query(
          `SELECT job_queue.enqueue_phase2_canary(
             $1::uuid, $2::uuid, $3::text, $4::text, NULL::text
           )`,
          [deadJobId, deadIntentId, deadKeyHash, requestId]
        );
        const deadToken = randomUUID();
        await expect(
          fixture.worker.query("SELECT * FROM job_queue.claim_one($1::uuid)", [
            deadToken,
          ])
        ).resolves.toMatchObject({ rows: [{ job_id: deadJobId }] });
        await expect(
          fixture.worker.query(
            "SELECT * FROM job_queue.fail_job($1::uuid, $2::uuid, $3::text)",
            [deadJobId, deadToken, "PAYLOAD_INVALID"]
          )
        ).resolves.toMatchObject({
          rows: [{ accepted: true, job_status: "DEAD", retry_at: null }],
        });

        await expectDenied(
          fixture.worker,
          `SELECT * FROM public."DurableJob" LIMIT 1`
        );
        await expectDenied(
          fixture.worker,
          `INSERT INTO public."WorkerCanaryIntent" (
             "id", "idempotencyKeyHash", "requestDigest", "requestId"
           ) VALUES ($1::uuid, $2, $3, $4)`,
          [
            randomUUID(),
            hashPhase2CanaryIdempotencyKey(`worker-forbidden-${suffix}`),
            "c".repeat(64),
            requestId,
          ]
        );
        await expectDenied(
          fixture.worker,
          `UPDATE public."DurableJob" SET "status" = 'SUCCEEDED'`
        );
        await expectDenied(
          fixture.worker,
          `DELETE FROM public."WorkerCanaryJob"`
        );
        await expectDenied(
          fixture.worker,
          `SELECT job_queue.enqueue_phase2_canary(
             $1::uuid, $2::uuid, $3::text, $4::text, NULL::text
           )`,
          [randomUUID(), randomUUID(), "worker-forbidden", requestId]
        );
      } finally {
        await cleanupFixture(fixture);
      }
    },
    60_000
  );
});
