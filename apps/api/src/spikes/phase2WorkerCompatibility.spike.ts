import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import type { PrismaClient } from "@pumdoki/database";
import { Client } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadTestDatabase } from "../test/database.js";

const suffix = randomUUID().replaceAll("-", "").slice(0, 20);
const migrationRole = `p2m_${suffix}`;
const apiRole = `p2a_${suffix}`;
const workerRole = `p2w_${suffix}`;
const appSchema = `p2_${suffix}_app`;
const jobSchema = `p2_${suffix}_jobs`;
const generatedIdentifiers = [
  migrationRole,
  apiRole,
  workerRole,
  appSchema,
  jobSchema,
] as const;
const expectedDatabaseName = "pumdoki_dev";
const expectedBootstrapRole = "pumdoki";
const expectedDatabasePort = "5432";

let database: PrismaClient | undefined;
let admin: Client | undefined;
let apiClient: Client | undefined;
let workerOne: Client | undefined;
let workerTwo: Client | undefined;
let connectionString = "";
const createdRoles: string[] = [];
const createdSchemas: string[] = [];

function quoteIdentifier(identifier: string): string {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(identifier)) {
    throw new Error(`Unsafe generated PostgreSQL identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}

function loadDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    const rootEnv = fileURLToPath(new URL("../../../../.env", import.meta.url));
    if (existsSync(rootEnv)) loadEnvFile(rootEnv);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for the Phase 2 worker compatibility spike"
    );
  }
  return process.env.DATABASE_URL;
}

function assertSafeTarget(databaseUrl: string): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The Phase 2 worker spike refuses NODE_ENV=production");
  }

  const parsed = new URL(databaseUrl);
  if (!new Set(["postgres:", "postgresql:"]).has(parsed.protocol)) {
    throw new Error("The Phase 2 worker spike requires PostgreSQL");
  }
  if (
    !new Set(["localhost", "127.0.0.1", "[::1]", "::1"]).has(parsed.hostname)
  ) {
    throw new Error(
      "The Phase 2 worker spike may run only against a loopback PostgreSQL host"
    );
  }
  if ([...parsed.searchParams].length) {
    throw new Error(
      "The Phase 2 worker spike refuses PostgreSQL connection query parameters"
    );
  }
  if (parsed.port !== expectedDatabasePort) {
    throw new Error(
      "The Phase 2 worker spike requires the exact local Compose PostgreSQL port"
    );
  }

  const databaseName = decodeURIComponent(parsed.pathname.slice(1));
  const bootstrapRole = decodeURIComponent(parsed.username);
  if (
    databaseName !== expectedDatabaseName ||
    bootstrapRole !== expectedBootstrapRole
  ) {
    throw new Error(
      "The Phase 2 worker spike requires the exact local Compose database and bootstrap role"
    );
  }
}

function databaseErrorCodes(error: unknown): string[] {
  const codes = new Set<string>();
  const pending: unknown[] = [error];
  const seen = new Set<unknown>();

  while (pending.length) {
    const current = pending.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    const record = current as Record<string, unknown>;
    for (const key of ["code", "originalCode"] as const) {
      if (typeof record[key] === "string") codes.add(record[key]);
    }
    for (const key of ["cause", "meta", "driverAdapterError"] as const) {
      if (record[key] && typeof record[key] === "object") {
        pending.push(record[key]);
      }
    }
  }

  return [...codes];
}

function schemaSetupSql(): string {
  const app = quoteIdentifier(appSchema);
  const jobs = quoteIdentifier(jobSchema);
  const api = quoteIdentifier(apiRole);
  const worker = quoteIdentifier(workerRole);

  return `
    REVOKE ALL ON SCHEMA ${app}, ${jobs} FROM PUBLIC;

    CREATE TABLE ${app}.domain_intent (
      id uuid PRIMARY KEY,
      description text NOT NULL CHECK (
        char_length(description) BETWEEN 1 AND 200
      ),
      created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
    );

    CREATE TABLE ${jobs}.job (
      id uuid PRIMARY KEY,
      domain_id uuid NOT NULL REFERENCES ${app}.domain_intent(id) ON DELETE RESTRICT,
      kind text NOT NULL CHECK (kind = 'phase2.canary'),
      payload_version integer NOT NULL CHECK (payload_version = 1),
      payload jsonb NOT NULL,
      dedupe_key text NOT NULL UNIQUE CHECK (
        char_length(dedupe_key) BETWEEN 1 AND 200
      ),
      status text NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'RUNNING', 'SUCCEEDED')
      ),
      available_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
      attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
      max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 10),
      lease_token uuid,
      lease_expires_at timestamptz,
      completed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
      updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
      CHECK (
        (status = 'RUNNING' AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
        OR
        (status <> 'RUNNING' AND lease_token IS NULL AND lease_expires_at IS NULL)
      )
    );

    REVOKE ALL ON ALL TABLES IN SCHEMA ${app}, ${jobs} FROM PUBLIC;

    CREATE FUNCTION ${jobs}.enqueue_canary(
      p_job_id uuid,
      p_domain_id uuid,
      p_dedupe_key text
    ) RETURNS uuid
    LANGUAGE plpgsql
    VOLATILE
    SECURITY DEFINER
    SET search_path = pg_catalog
    AS $enqueue$
    BEGIN
      IF p_job_id IS NULL OR p_domain_id IS NULL OR p_dedupe_key IS NULL
         OR char_length(p_dedupe_key) NOT BETWEEN 1 AND 200 THEN
        RAISE EXCEPTION 'invalid canary enqueue input' USING ERRCODE = '22023';
      END IF;

      INSERT INTO ${jobs}.job (
        id,
        domain_id,
        kind,
        payload_version,
        payload,
        dedupe_key
      ) VALUES (
        p_job_id,
        p_domain_id,
        'phase2.canary',
        1,
        pg_catalog.jsonb_build_object('domainId', p_domain_id),
        p_dedupe_key
      );
      RETURN p_job_id;
    END;
    $enqueue$;

    CREATE FUNCTION ${jobs}.claim_canary(
      p_lease_token uuid,
      p_lease_seconds integer
    ) RETURNS TABLE (
      job_id uuid,
      domain_id uuid,
      payload jsonb,
      attempt_count integer
    )
    LANGUAGE plpgsql
    VOLATILE
    SECURITY DEFINER
    SET search_path = pg_catalog
    AS $claim$
    BEGIN
      IF p_lease_token IS NULL OR p_lease_seconds NOT BETWEEN 1 AND 300 THEN
        RAISE EXCEPTION 'invalid canary claim input' USING ERRCODE = '22023';
      END IF;

      RETURN QUERY
      WITH candidate AS (
        SELECT queued.id
        FROM ${jobs}.job AS queued
        WHERE (
          queued.status = 'PENDING'
          OR (
            queued.status = 'RUNNING'
            AND queued.lease_expires_at <= pg_catalog.clock_timestamp()
          )
        )
          AND queued.available_at <= pg_catalog.clock_timestamp()
          AND queued.attempt_count < queued.max_attempts
        ORDER BY queued.available_at, queued.created_at, queued.id
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE ${jobs}.job AS queued
      SET status = 'RUNNING',
          attempt_count = queued.attempt_count + 1,
          lease_token = p_lease_token,
          lease_expires_at = pg_catalog.clock_timestamp()
            + pg_catalog.make_interval(secs => p_lease_seconds),
          updated_at = pg_catalog.clock_timestamp()
      FROM candidate
      WHERE queued.id = candidate.id
      RETURNING
        queued.id,
        queued.domain_id,
        queued.payload,
        queued.attempt_count;
    END;
    $claim$;

    CREATE FUNCTION ${jobs}.complete_canary(
      p_job_id uuid,
      p_lease_token uuid
    ) RETURNS boolean
    LANGUAGE plpgsql
    VOLATILE
    SECURITY DEFINER
    SET search_path = pg_catalog
    AS $complete$
    DECLARE
      affected integer;
    BEGIN
      UPDATE ${jobs}.job AS queued
      SET status = 'SUCCEEDED',
          lease_token = NULL,
          lease_expires_at = NULL,
          completed_at = pg_catalog.clock_timestamp(),
          updated_at = pg_catalog.clock_timestamp()
      WHERE queued.id = p_job_id
        AND queued.status = 'RUNNING'
        AND queued.lease_token = p_lease_token
        AND queued.lease_expires_at > pg_catalog.clock_timestamp();
      GET DIAGNOSTICS affected = ROW_COUNT;
      RETURN affected = 1;
    END;
    $complete$;

    REVOKE ALL ON FUNCTION ${jobs}.enqueue_canary(uuid, uuid, text) FROM PUBLIC;
    REVOKE ALL ON FUNCTION ${jobs}.claim_canary(uuid, integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION ${jobs}.complete_canary(uuid, uuid) FROM PUBLIC;

    GRANT USAGE ON SCHEMA ${app}, ${jobs} TO ${api};
    GRANT INSERT ON ${app}.domain_intent TO ${api};
    GRANT EXECUTE ON FUNCTION ${jobs}.enqueue_canary(uuid, uuid, text) TO ${api};

    GRANT USAGE ON SCHEMA ${app}, ${jobs} TO ${worker};
    GRANT SELECT ON ${app}.domain_intent TO ${worker};
    GRANT EXECUTE ON FUNCTION ${jobs}.claim_canary(uuid, integer) TO ${worker};
    GRANT EXECUTE ON FUNCTION ${jobs}.complete_canary(uuid, uuid) TO ${worker};
  `;
}

async function connectAs(role: string): Promise<Client> {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query(`SET SESSION AUTHORIZATION ${quoteIdentifier(role)}`);
    const identity = await client.query<{
      sessionUser: string;
      currentUser: string;
    }>(`SELECT session_user AS "sessionUser", current_user AS "currentUser"`);
    expect(identity.rows).toEqual([{ sessionUser: role, currentUser: role }]);
    return client;
  } catch (error) {
    await client.end().catch(() => undefined);
    throw error;
  }
}

async function enqueueWithPrisma(options: {
  domainId: string;
  jobId: string;
  dedupeKey: string;
  description: string;
  waitFor?: Promise<void>;
  onInserted?: () => void;
  failAfterEnqueue?: boolean;
}): Promise<void> {
  if (!database) throw new Error("Prisma is not connected");

  await database.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${quoteIdentifier(apiRole)}`);
      await tx.$executeRawUnsafe(
        `INSERT INTO ${quoteIdentifier(appSchema)}.domain_intent
          (id, description)
         VALUES ($1::uuid, $2)`,
        options.domainId,
        options.description
      );
      await tx.$queryRawUnsafe(
        `SELECT ${quoteIdentifier(jobSchema)}.enqueue_canary(
          $1::uuid,
          $2::uuid,
          $3::text
        )`,
        options.jobId,
        options.domainId,
        options.dedupeKey
      );
      options.onInserted?.();
      if (options.waitFor) await options.waitFor;
      if (options.failAfterEnqueue) throw new Error("force spike rollback");
    },
    { timeout: 10_000 }
  );
}

async function claim(client: Client, leaseToken: string) {
  return client.query<{
    job_id: string;
    domain_id: string;
    payload: { domainId: string };
    attempt_count: number;
  }>(
    `SELECT * FROM ${quoteIdentifier(jobSchema)}.claim_canary(
      $1::uuid,
      30
    )`,
    [leaseToken]
  );
}

async function complete(
  client: Client,
  jobId: string,
  leaseToken: string
): Promise<boolean> {
  const result = await client.query<{ completed: boolean }>(
    `SELECT ${quoteIdentifier(jobSchema)}.complete_canary(
      $1::uuid,
      $2::uuid
    ) AS completed`,
    [jobId, leaseToken]
  );
  return result.rows[0]?.completed ?? false;
}

async function endClient(client: Client | undefined): Promise<void> {
  if (!client) return;
  try {
    await client.query("RESET SESSION AUTHORIZATION");
  } catch {
    // Partial setup may leave the connection without impersonation.
  }
  await client.end();
}

async function attemptCleanup(
  errors: unknown[],
  action: () => Promise<unknown>
): Promise<void> {
  try {
    await action();
  } catch (error) {
    errors.push(error);
  }
}

beforeAll(async () => {
  for (const identifier of generatedIdentifiers) quoteIdentifier(identifier);
  connectionString = loadDatabaseUrl();
  assertSafeTarget(connectionString);

  const adminClient = new Client({ connectionString });
  await adminClient.connect();
  admin = adminClient;
  const server = await admin.query<{
    serverVersionNum: string;
    currentDatabase: string;
    currentUser: string;
    serverPort: number;
    superuser: boolean;
  }>(`
    SELECT
      pg_catalog.current_setting('server_version_num') AS "serverVersionNum",
      pg_catalog.current_database() AS "currentDatabase",
      current_user AS "currentUser",
      pg_catalog.inet_server_port() AS "serverPort",
      role.rolsuper AS superuser
    FROM pg_catalog.pg_roles AS role
    WHERE role.rolname = current_user
  `);
  const metadata = server.rows[0];
  if (
    !metadata ||
    Math.floor(Number(metadata.serverVersionNum) / 10_000) !== 17
  ) {
    throw new Error("The Phase 2 worker spike requires PostgreSQL 17");
  }
  if (!metadata.superuser) {
    throw new Error(
      "The Phase 2 worker spike requires the local test bootstrap superuser"
    );
  }
  if (
    metadata.currentDatabase !== expectedDatabaseName ||
    metadata.currentUser !== expectedBootstrapRole ||
    metadata.serverPort !== Number(expectedDatabasePort)
  ) {
    throw new Error(
      "The connected PostgreSQL identity does not match the local Compose target"
    );
  }

  for (const role of [migrationRole, apiRole, workerRole]) {
    await admin.query(`CREATE ROLE ${quoteIdentifier(role)}
      NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE
      NOREPLICATION NOBYPASSRLS`);
    createdRoles.push(role);
  }
  for (const schema of [appSchema, jobSchema]) {
    await admin.query(
      `CREATE SCHEMA ${quoteIdentifier(schema)} AUTHORIZATION ${quoteIdentifier(migrationRole)}`
    );
    createdSchemas.push(schema);
  }

  await admin.query(
    `SET SESSION AUTHORIZATION ${quoteIdentifier(migrationRole)}`
  );
  try {
    await admin.query(schemaSetupSql());
  } finally {
    await admin.query("RESET SESSION AUTHORIZATION");
  }

  database = await loadTestDatabase();
  apiClient = await connectAs(apiRole);
  workerOne = await connectAs(workerRole);
  workerTwo = await connectAs(workerRole);
}, 30_000);

beforeEach(async () => {
  if (!admin) throw new Error("Spike admin connection is not ready");
  await admin.query(
    `TRUNCATE TABLE
      ${quoteIdentifier(jobSchema)}.job,
      ${quoteIdentifier(appSchema)}.domain_intent`
  );
});

afterAll(async () => {
  const cleanupErrors: unknown[] = [];
  for (const client of [apiClient, workerOne, workerTwo]) {
    await attemptCleanup(cleanupErrors, () => endClient(client));
  }
  if (database) {
    await attemptCleanup(cleanupErrors, () => database!.$disconnect());
  }
  if (admin) {
    await attemptCleanup(cleanupErrors, () => admin!.end());
  }

  if (connectionString && (createdSchemas.length || createdRoles.length)) {
    const cleanupAdmin = new Client({ connectionString });
    let cleanupConnected = false;
    try {
      await cleanupAdmin.connect();
      cleanupConnected = true;
      await attemptCleanup(cleanupErrors, () =>
        cleanupAdmin.query("SET lock_timeout = '2s'")
      );
      await attemptCleanup(cleanupErrors, () =>
        cleanupAdmin.query("SET statement_timeout = '5s'")
      );
      for (const schema of [...createdSchemas].reverse()) {
        await attemptCleanup(cleanupErrors, () =>
          cleanupAdmin.query(
            `DROP SCHEMA IF EXISTS ${quoteIdentifier(schema)} CASCADE`
          )
        );
      }
      for (const role of [...createdRoles].reverse()) {
        await attemptCleanup(cleanupErrors, () =>
          cleanupAdmin.query(`DROP OWNED BY ${quoteIdentifier(role)}`)
        );
        await attemptCleanup(cleanupErrors, () =>
          cleanupAdmin.query(`DROP ROLE IF EXISTS ${quoteIdentifier(role)}`)
        );
      }
    } catch (error) {
      cleanupErrors.push(error);
    } finally {
      if (cleanupConnected) {
        await attemptCleanup(cleanupErrors, () => cleanupAdmin.end());
      }
    }
  }

  if (cleanupErrors.length) {
    throw new AggregateError(
      cleanupErrors,
      "Phase 2 spike could not clean every temporary database object"
    );
  }
}, 30_000);

describe.sequential("Phase 2 PostgreSQL worker compatibility spike", () => {
  it("separates migration ownership from API and worker runtime roles", async () => {
    if (!admin || !apiClient || !workerOne) throw new Error("Spike not ready");

    const roleAttributes = await admin.query<{
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
      [[migrationRole, apiRole, workerRole]]
    );
    expect(roleAttributes.rows).toHaveLength(3);
    for (const role of roleAttributes.rows) {
      expect(role).toMatchObject({
        canLogin: false,
        inherit: false,
        superuser: false,
        createDatabase: false,
        createRole: false,
        replication: false,
        bypassRls: false,
      });
    }

    const ownership = await admin.query<{ owner: string }>(
      `SELECT pg_catalog.pg_get_userbyid(namespace.nspowner) AS owner
       FROM pg_catalog.pg_namespace AS namespace
       WHERE namespace.nspname = ANY($1::text[])
       UNION ALL
       SELECT pg_catalog.pg_get_userbyid(class.relowner) AS owner
       FROM pg_catalog.pg_class AS class
       JOIN pg_catalog.pg_namespace AS namespace
         ON namespace.oid = class.relnamespace
       WHERE namespace.nspname = ANY($1::text[])
         AND class.relkind = 'r'
       UNION ALL
       SELECT pg_catalog.pg_get_userbyid(proc.proowner) AS owner
       FROM pg_catalog.pg_proc AS proc
       JOIN pg_catalog.pg_namespace AS namespace
         ON namespace.oid = proc.pronamespace
       WHERE namespace.nspname = $2`,
      [[appSchema, jobSchema], jobSchema]
    );
    expect(ownership.rows.length).toBeGreaterThanOrEqual(7);
    expect(new Set(ownership.rows.map(({ owner }) => owner))).toEqual(
      new Set([migrationRole])
    );

    const routines = await admin.query<{ securityDefiner: boolean }>(
      `SELECT proc.prosecdef AS "securityDefiner"
       FROM pg_catalog.pg_proc AS proc
       JOIN pg_catalog.pg_namespace AS namespace
         ON namespace.oid = proc.pronamespace
       WHERE namespace.nspname = $1`,
      [jobSchema]
    );
    expect(routines.rows).toHaveLength(3);
    expect(routines.rows.every(({ securityDefiner }) => securityDefiner)).toBe(
      true
    );

    const privileges = await admin.query<{
      role: string;
      appUsage: boolean;
      appCreate: boolean;
      jobUsage: boolean;
      jobCreate: boolean;
      domainSelect: boolean;
      domainInsert: boolean;
      domainUpdate: boolean;
      domainDelete: boolean;
      domainTruncate: boolean;
      jobSelect: boolean;
      jobInsert: boolean;
      jobUpdate: boolean;
      jobDelete: boolean;
      jobTruncate: boolean;
      enqueueExecute: boolean;
      claimExecute: boolean;
      completeExecute: boolean;
    }>(
      `SELECT
         candidate.role,
         pg_catalog.has_schema_privilege(candidate.role, $2, 'USAGE') AS "appUsage",
         pg_catalog.has_schema_privilege(candidate.role, $2, 'CREATE') AS "appCreate",
         pg_catalog.has_schema_privilege(candidate.role, $3, 'USAGE') AS "jobUsage",
         pg_catalog.has_schema_privilege(candidate.role, $3, 'CREATE') AS "jobCreate",
         pg_catalog.has_table_privilege(candidate.role, $4, 'SELECT') AS "domainSelect",
         pg_catalog.has_table_privilege(candidate.role, $4, 'INSERT') AS "domainInsert",
         pg_catalog.has_table_privilege(candidate.role, $4, 'UPDATE') AS "domainUpdate",
         pg_catalog.has_table_privilege(candidate.role, $4, 'DELETE') AS "domainDelete",
         pg_catalog.has_table_privilege(candidate.role, $4, 'TRUNCATE') AS "domainTruncate",
         pg_catalog.has_table_privilege(candidate.role, $5, 'SELECT') AS "jobSelect",
         pg_catalog.has_table_privilege(candidate.role, $5, 'INSERT') AS "jobInsert",
         pg_catalog.has_table_privilege(candidate.role, $5, 'UPDATE') AS "jobUpdate",
         pg_catalog.has_table_privilege(candidate.role, $5, 'DELETE') AS "jobDelete",
         pg_catalog.has_table_privilege(candidate.role, $5, 'TRUNCATE') AS "jobTruncate",
         pg_catalog.has_function_privilege(candidate.role, $6, 'EXECUTE') AS "enqueueExecute",
         pg_catalog.has_function_privilege(candidate.role, $7, 'EXECUTE') AS "claimExecute",
         pg_catalog.has_function_privilege(candidate.role, $8, 'EXECUTE') AS "completeExecute"
       FROM unnest($1::text[]) AS candidate(role)
       ORDER BY candidate.role`,
      [
        [apiRole, workerRole],
        appSchema,
        jobSchema,
        `${appSchema}.domain_intent`,
        `${jobSchema}.job`,
        `${jobSchema}.enqueue_canary(uuid,uuid,text)`,
        `${jobSchema}.claim_canary(uuid,integer)`,
        `${jobSchema}.complete_canary(uuid,uuid)`,
      ]
    );
    expect(privileges.rows).toEqual([
      {
        role: apiRole,
        appUsage: true,
        appCreate: false,
        jobUsage: true,
        jobCreate: false,
        domainSelect: false,
        domainInsert: true,
        domainUpdate: false,
        domainDelete: false,
        domainTruncate: false,
        jobSelect: false,
        jobInsert: false,
        jobUpdate: false,
        jobDelete: false,
        jobTruncate: false,
        enqueueExecute: true,
        claimExecute: false,
        completeExecute: false,
      },
      {
        role: workerRole,
        appUsage: true,
        appCreate: false,
        jobUsage: true,
        jobCreate: false,
        domainSelect: true,
        domainInsert: false,
        domainUpdate: false,
        domainDelete: false,
        domainTruncate: false,
        jobSelect: false,
        jobInsert: false,
        jobUpdate: false,
        jobDelete: false,
        jobTruncate: false,
        enqueueExecute: false,
        claimExecute: true,
        completeExecute: true,
      },
    ]);

    await expect(
      apiClient.query(`SET ROLE ${quoteIdentifier(migrationRole)}`)
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      workerOne.query(`SET ROLE ${quoteIdentifier(migrationRole)}`)
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      apiClient.query(
        `CREATE TABLE ${quoteIdentifier(appSchema)}.forbidden(id integer)`
      )
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      workerOne.query(
        `CREATE TABLE ${quoteIdentifier(jobSchema)}.forbidden(id integer)`
      )
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("commits and rolls back domain intent plus enqueue in one Prisma transaction", async () => {
    if (!admin) throw new Error("Spike not ready");

    const committedDomainId = randomUUID();
    const committedJobId = randomUUID();
    let releaseTransaction!: () => void;
    let reportInserted!: () => void;
    const holdTransaction = new Promise<void>((resolve) => {
      releaseTransaction = resolve;
    });
    const inserted = new Promise<void>((resolve) => {
      reportInserted = resolve;
    });

    const transaction = enqueueWithPrisma({
      domainId: committedDomainId,
      jobId: committedJobId,
      dedupeKey: `commit-${suffix}`,
      description: "Committed canary",
      waitFor: holdTransaction,
      onInserted: reportInserted,
    });
    let beforeCommitRows: Array<{ domains: number; jobs: number }> | undefined;
    try {
      await Promise.race([
        inserted,
        transaction.then(() => {
          throw new Error("The held Prisma transaction completed too early");
        }),
      ]);
      beforeCommitRows = (
        await admin.query<{ domains: number; jobs: number }>(
          `SELECT
            (SELECT count(*)::integer FROM ${quoteIdentifier(appSchema)}.domain_intent) AS domains,
            (SELECT count(*)::integer FROM ${quoteIdentifier(jobSchema)}.job) AS jobs`
        )
      ).rows;
    } finally {
      releaseTransaction();
      await transaction;
    }
    expect(beforeCommitRows).toEqual([{ domains: 0, jobs: 0 }]);

    const afterCommit = await admin.query<{ domains: number; jobs: number }>(
      `SELECT
        (SELECT count(*)::integer FROM ${quoteIdentifier(appSchema)}.domain_intent) AS domains,
        (SELECT count(*)::integer FROM ${quoteIdentifier(jobSchema)}.job) AS jobs`
    );
    expect(afterCommit.rows).toEqual([{ domains: 1, jobs: 1 }]);

    const rolledBackDomainId = randomUUID();
    const rolledBackJobId = randomUUID();
    await expect(
      enqueueWithPrisma({
        domainId: rolledBackDomainId,
        jobId: rolledBackJobId,
        dedupeKey: `rollback-${suffix}`,
        description: "Rolled-back canary",
        failAfterEnqueue: true,
      })
    ).rejects.toThrow("force spike rollback");

    const rolledBack = await admin.query<{ domains: number; jobs: number }>(
      `SELECT
        (SELECT count(*)::integer FROM ${quoteIdentifier(appSchema)}.domain_intent WHERE id = $1::uuid) AS domains,
        (SELECT count(*)::integer FROM ${quoteIdentifier(jobSchema)}.job WHERE id = $2::uuid) AS jobs`,
      [rolledBackDomainId, rolledBackJobId]
    );
    expect(rolledBack.rows).toEqual([{ domains: 0, jobs: 0 }]);

    const enqueueFailureDomainId = randomUUID();
    const enqueueFailureJobId = randomUUID();
    let enqueueFailure: unknown;
    try {
      await enqueueWithPrisma({
        domainId: enqueueFailureDomainId,
        jobId: enqueueFailureJobId,
        dedupeKey: `commit-${suffix}`,
        description: "Enqueue-failure canary",
      });
    } catch (error) {
      enqueueFailure = error;
    }
    expect(enqueueFailure).toBeDefined();
    expect(databaseErrorCodes(enqueueFailure)).toContain("23505");

    const enqueueFailureRollback = await admin.query<{
      domains: number;
      jobs: number;
    }>(
      `SELECT
        (SELECT count(*)::integer FROM ${quoteIdentifier(appSchema)}.domain_intent WHERE id = $1::uuid) AS domains,
        (SELECT count(*)::integer FROM ${quoteIdentifier(jobSchema)}.job WHERE id = $2::uuid) AS jobs`,
      [enqueueFailureDomainId, enqueueFailureJobId]
    );
    expect(enqueueFailureRollback.rows).toEqual([{ domains: 0, jobs: 0 }]);
  });

  it("limits API and worker roles to their allowlisted routines", async () => {
    if (!apiClient || !workerOne) throw new Error("Spike not ready");

    const domainId = randomUUID();
    const jobId = randomUUID();
    await apiClient.query(
      `INSERT INTO ${quoteIdentifier(appSchema)}.domain_intent (id, description)
       VALUES ($1::uuid, $2)`,
      [domainId, "Privilege canary"]
    );
    await apiClient.query(
      `SELECT ${quoteIdentifier(jobSchema)}.enqueue_canary($1::uuid, $2::uuid, $3::text)`,
      [jobId, domainId, `privilege-${suffix}`]
    );

    await expect(
      apiClient.query(`SELECT * FROM ${quoteIdentifier(jobSchema)}.job`)
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      apiClient.query(
        `INSERT INTO ${quoteIdentifier(jobSchema)}.job
          (id, domain_id, kind, payload_version, payload, dedupe_key)
         VALUES ($1::uuid, $2::uuid, 'phase2.canary', 1, '{}'::jsonb, 'direct')`,
        [randomUUID(), domainId]
      )
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      apiClient.query(
        `SELECT * FROM ${quoteIdentifier(jobSchema)}.claim_canary($1::uuid, 30)`,
        [randomUUID()]
      )
    ).rejects.toMatchObject({ code: "42501" });

    const workerRead = await workerOne.query<{ description: string }>(
      `SELECT description FROM ${quoteIdentifier(appSchema)}.domain_intent WHERE id = $1::uuid`,
      [domainId]
    );
    expect(workerRead.rows).toEqual([{ description: "Privilege canary" }]);
    await expect(
      workerOne.query(
        `INSERT INTO ${quoteIdentifier(appSchema)}.domain_intent (id, description)
         VALUES ($1::uuid, 'forbidden')`,
        [randomUUID()]
      )
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      workerOne.query(
        `UPDATE ${quoteIdentifier(jobSchema)}.job SET status = 'SUCCEEDED'`
      )
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      workerOne.query(
        `SELECT ${quoteIdentifier(jobSchema)}.enqueue_canary($1::uuid, $2::uuid, 'forbidden')`,
        [randomUUID(), domainId]
      )
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("lets two workers claim different rows without blocking", async () => {
    if (!admin || !workerOne || !workerTwo) throw new Error("Spike not ready");

    const first = { domainId: randomUUID(), jobId: randomUUID() };
    const second = { domainId: randomUUID(), jobId: randomUUID() };
    await enqueueWithPrisma({
      ...first,
      dedupeKey: `skip-locked-one-${suffix}`,
      description: "First concurrent canary",
    });
    await enqueueWithPrisma({
      ...second,
      dedupeKey: `skip-locked-two-${suffix}`,
      description: "Second concurrent canary",
    });

    const firstToken = randomUUID();
    const secondToken = randomUUID();
    let firstOpen = false;
    let secondOpen = false;
    try {
      await workerOne.query("BEGIN");
      firstOpen = true;
      const firstClaim = await claim(workerOne, firstToken);
      expect(firstClaim.rows).toHaveLength(1);

      await workerTwo.query("BEGIN");
      secondOpen = true;
      await workerTwo.query("SET LOCAL statement_timeout = '2s'");
      const secondClaim = await claim(workerTwo, secondToken);
      expect(secondClaim.rows).toHaveLength(1);
      expect(
        new Set([firstClaim.rows[0]?.job_id, secondClaim.rows[0]?.job_id])
      ).toEqual(new Set([first.jobId, second.jobId]));

      expect(
        await complete(workerOne, firstClaim.rows[0]!.job_id, firstToken)
      ).toBe(true);
      expect(
        await complete(workerTwo, secondClaim.rows[0]!.job_id, secondToken)
      ).toBe(true);
      await workerOne.query("COMMIT");
      firstOpen = false;
      await workerTwo.query("COMMIT");
      secondOpen = false;
    } finally {
      if (firstOpen) await workerOne.query("ROLLBACK");
      if (secondOpen) await workerTwo.query("ROLLBACK");
    }

    const thirdClaim = await claim(workerOne, randomUUID());
    expect(thirdClaim.rows).toHaveLength(0);
    const finalJobs = await admin.query<{
      status: string;
      attemptCount: number;
      leaseToken: string | null;
    }>(
      `SELECT
        status,
        attempt_count AS "attemptCount",
        lease_token AS "leaseToken"
       FROM ${quoteIdentifier(jobSchema)}.job
       ORDER BY id`
    );
    expect(finalJobs.rows).toEqual([
      { status: "SUCCEEDED", attemptCount: 1, leaseToken: null },
      { status: "SUCCEEDED", attemptCount: 1, leaseToken: null },
    ]);
  });

  it("rejects a stale acknowledgement after lease reclamation", async () => {
    if (!admin || !workerOne || !workerTwo) throw new Error("Spike not ready");

    const domainId = randomUUID();
    const jobId = randomUUID();
    await enqueueWithPrisma({
      domainId,
      jobId,
      dedupeKey: `stale-${suffix}`,
      description: "Lease fencing canary",
    });

    const staleToken = randomUUID();
    const currentToken = randomUUID();
    const originalClaim = await claim(workerOne, staleToken);
    expect(originalClaim.rows).toMatchObject([
      { job_id: jobId, attempt_count: 1 },
    ]);

    await admin.query(
      `UPDATE ${quoteIdentifier(jobSchema)}.job
       SET lease_expires_at = pg_catalog.clock_timestamp() - interval '1 second'
       WHERE id = $1::uuid`,
      [jobId]
    );
    const reclaimed = await claim(workerTwo, currentToken);
    expect(reclaimed.rows).toMatchObject([{ job_id: jobId, attempt_count: 2 }]);

    expect(await complete(workerOne, jobId, staleToken)).toBe(false);
    expect(await complete(workerTwo, jobId, currentToken)).toBe(true);

    const finalJob = await admin.query<{
      status: string;
      attemptCount: number;
    }>(
      `SELECT status, attempt_count AS "attemptCount"
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = $1::uuid`,
      [jobId]
    );
    expect(finalJob.rows).toEqual([{ status: "SUCCEEDED", attemptCount: 2 }]);
  });
});
