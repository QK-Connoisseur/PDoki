import { randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const suffix = randomUUID().replaceAll("-", "").slice(0, 20);
const candidateDatabase = `p2c_${suffix}`;
const migrationRole = `p2cm_${suffix}`;
const apiRole = `p2ca_${suffix}`;
const workerRole = `p2cw_${suffix}`;
const apiPassword = randomUUID().replaceAll("-", "");
const workerPassword = randomUUID().replaceAll("-", "");
const appSchema = "candidate_app";
const jobSchema = "candidate_jobs";
const expectedBootstrapDatabase = "pumdoki_dev";
const expectedBootstrapRole = "pumdoki";
const expectedDatabasePort = "5432";
const generatedClusterIdentifiers = [
  candidateDatabase,
  migrationRole,
  apiRole,
  workerRole,
] as const;

type Claim = {
  job_id: string;
  domain_id: string;
  payload: { domainId: string };
  attempt_count: number;
  lease_expires_at: Date;
};

type FailureResult = {
  accepted: boolean;
  job_status: "PENDING" | "DEAD" | null;
  retry_at: Date | null;
};

let bootstrapConnectionString = "";
let candidateConnectionString = "";
let databaseCreated = false;
let bootstrap: Client | undefined;
let candidateAdmin: Client | undefined;
let apiClient: Client | undefined;
let workerOne: Client | undefined;
let workerTwo: Client | undefined;
let normalMigrationSnapshot = "";
const createdRoles: string[] = [];
const auxiliaryClients = new Set<Client>();

function quoteIdentifier(identifier: string): string {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(identifier)) {
    throw new Error(`Unsafe generated PostgreSQL identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}

function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function loadDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    const rootEnv = fileURLToPath(new URL("../../../../.env", import.meta.url));
    if (existsSync(rootEnv)) loadEnvFile(rootEnv);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for the Phase 2 worker candidate evaluation"
    );
  }
  return process.env.DATABASE_URL;
}

function assertSafeBootstrapTarget(databaseUrl: string): URL {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "The Phase 2 worker candidate evaluation refuses NODE_ENV=production"
    );
  }

  const parsed = new URL(databaseUrl);
  if (!new Set(["postgres:", "postgresql:"]).has(parsed.protocol)) {
    throw new Error(
      "The Phase 2 worker candidate evaluation requires PostgreSQL"
    );
  }
  if (
    !new Set(["localhost", "127.0.0.1", "[::1]", "::1"]).has(parsed.hostname)
  ) {
    throw new Error(
      "The Phase 2 worker candidate evaluation may run only against loopback PostgreSQL"
    );
  }
  if ([...parsed.searchParams].length) {
    throw new Error(
      "The Phase 2 worker candidate evaluation refuses PostgreSQL URL query parameters"
    );
  }
  if (parsed.port !== expectedDatabasePort) {
    throw new Error(
      "The Phase 2 worker candidate evaluation requires the exact local Compose PostgreSQL port"
    );
  }

  const databaseName = decodeURIComponent(parsed.pathname.slice(1));
  const bootstrapRole = decodeURIComponent(parsed.username);
  if (
    databaseName !== expectedBootstrapDatabase ||
    bootstrapRole !== expectedBootstrapRole
  ) {
    throw new Error(
      "The Phase 2 worker candidate evaluation requires the exact local Compose database and bootstrap role"
    );
  }
  return parsed;
}

async function assertLoopbackResolution(hostname: string): Promise<void> {
  const addresses = await lookup(hostname.replace(/^\[|\]$/g, ""), {
    all: true,
  });
  if (
    !addresses.length ||
    addresses.some(
      ({ address }) =>
        !address.startsWith("127.") &&
        address !== "::1" &&
        !address.startsWith("::ffff:127.")
    )
  ) {
    throw new Error(
      "The Phase 2 worker candidate evaluation requires loopback-only hostname resolution"
    );
  }
}

async function renderMigration(): Promise<string> {
  const source = await readFile(
    new URL("./phase2WorkerCandidate.migration.sql", import.meta.url),
    "utf8"
  );
  const replacements = new Map<string, string>([
    ["__DATABASE__", quoteIdentifier(candidateDatabase)],
    ["__MIGRATION_ROLE__", quoteIdentifier(migrationRole)],
    ["__API_ROLE__", quoteIdentifier(apiRole)],
    ["__WORKER_ROLE__", quoteIdentifier(workerRole)],
    ["__APP_SCHEMA__", quoteIdentifier(appSchema)],
    ["__JOB_SCHEMA__", quoteIdentifier(jobSchema)],
  ]);
  let rendered = source;
  for (const [token, identifier] of replacements) {
    rendered = rendered.replaceAll(token, identifier);
  }
  if (/__[A-Z_]+__/.test(rendered)) {
    throw new Error("Candidate migration contains an unresolved identifier");
  }
  return rendered;
}

async function readNormalMigrationSnapshot(client: Client): Promise<string> {
  const result = await client.query<{ snapshot: string }>(`
    SELECT COALESCE(
      pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'id', migration.id,
          'checksum', migration.checksum,
          'migrationName', migration.migration_name,
          'startedAt', migration.started_at,
          'finishedAt', migration.finished_at,
          'rolledBackAt', migration.rolled_back_at,
          'appliedStepsCount', migration.applied_steps_count
        )
        ORDER BY migration.id
      ),
      '[]'::jsonb
    )::text AS snapshot
    FROM public._prisma_migrations AS migration
  `);
  const snapshot = result.rows[0]?.snapshot;
  if (typeof snapshot !== "string") {
    throw new Error("Could not snapshot the normal Prisma migration ledger");
  }
  return snapshot;
}

async function connectAs(role: string, password: string): Promise<Client> {
  const roleUrl = new URL(candidateConnectionString);
  roleUrl.username = role;
  roleUrl.password = password;
  const client = new Client({
    connectionString: roleUrl.toString(),
    connectionTimeoutMillis: 2000,
  });
  try {
    await client.connect();
    const identity = await client.query<{
      sessionUser: string;
      currentUser: string;
      database: string;
    }>(
      `SELECT
         session_user AS "sessionUser",
         current_user AS "currentUser",
         pg_catalog.current_database() AS database`
    );
    expect(identity.rows).toEqual([
      {
        sessionUser: role,
        currentUser: role,
        database: candidateDatabase,
      },
    ]);
    return client;
  } catch (error) {
    await client.end().catch(() => undefined);
    throw error;
  }
}

async function endRoleClient(client: Client | undefined): Promise<void> {
  if (!client) return;
  await client.end();
  auxiliaryClients.delete(client);
}

async function withTimeout<T>(
  action: () => Promise<T>,
  timeoutMilliseconds: number,
  message: string
): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      action(),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error(message)),
          timeoutMilliseconds
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function attemptCleanup(
  errors: unknown[],
  action: () => Promise<unknown>,
  timeoutMilliseconds = 3000,
  deadlineAt?: number
): Promise<void> {
  const remainingMilliseconds = deadlineAt
    ? Math.max(1, deadlineAt - Date.now())
    : timeoutMilliseconds;
  const boundedTimeoutMilliseconds = Math.max(
    1,
    Math.min(timeoutMilliseconds, remainingMilliseconds)
  );
  try {
    await withTimeout(
      action,
      boundedTimeoutMilliseconds,
      "Candidate cleanup action timed out"
    );
  } catch (error) {
    errors.push(error);
  }
}

async function enqueueCanary(options: {
  description: string;
  dedupeKey: string;
}): Promise<{ domainId: string; jobId: string }> {
  if (!apiClient) throw new Error("Candidate API connection is not ready");
  const domainId = randomUUID();
  const jobId = randomUUID();
  await apiClient.query("BEGIN");
  try {
    await apiClient.query(
      `INSERT INTO ${quoteIdentifier(appSchema)}.domain_intent (id, description)
       VALUES ($1::uuid, $2::text)`,
      [domainId, options.description]
    );
    await apiClient.query(
      `SELECT ${quoteIdentifier(jobSchema)}.enqueue_canary(
         $1::uuid,
         $2::uuid,
         $3::text
       )`,
      [jobId, domainId, options.dedupeKey]
    );
    await apiClient.query("COMMIT");
  } catch (error) {
    await apiClient.query("ROLLBACK");
    throw error;
  }
  return { domainId, jobId };
}

async function claim(client: Client, leaseToken: string): Promise<Claim[]> {
  const result = await client.query<Claim>(
    `SELECT * FROM ${quoteIdentifier(jobSchema)}.claim_canary(
       $1::uuid
     )`,
    [leaseToken]
  );
  return result.rows;
}

async function renew(
  client: Client,
  jobId: string,
  leaseToken: string
): Promise<boolean> {
  const result = await client.query<{ renewed: boolean }>(
    `SELECT ${quoteIdentifier(jobSchema)}.renew_canary(
       $1::uuid,
       $2::uuid
     ) AS renewed`,
    [jobId, leaseToken]
  );
  return result.rows[0]?.renewed ?? false;
}

async function release(
  client: Client,
  jobId: string,
  leaseToken: string
): Promise<boolean> {
  const result = await client.query<{ released: boolean }>(
    `SELECT ${quoteIdentifier(jobSchema)}.release_canary(
       $1::uuid,
       $2::uuid
     ) AS released`,
    [jobId, leaseToken]
  );
  return result.rows[0]?.released ?? false;
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

async function fail(
  client: Client,
  jobId: string,
  leaseToken: string,
  failureCategory:
    | "transient"
    | "timeout"
    | "database"
    | "permanent" = "transient"
): Promise<FailureResult> {
  const result = await client.query<FailureResult>(
    `SELECT * FROM ${quoteIdentifier(jobSchema)}.fail_canary(
       $1::uuid,
       $2::uuid,
       $3::text
     )`,
    [jobId, leaseToken, failureCategory]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Candidate failure routine returned no result");
  return row;
}

class DrainingCandidateWorker {
  private acceptingClaims = true;
  private closed = false;
  private readonly active = new Set<Promise<void>>();
  private readonly pendingClaims = new Set<Promise<boolean>>();
  private readonly backgroundFailures: unknown[] = [];

  constructor(
    private readonly client: Client,
    private readonly handler: (claim: Claim) => Promise<void>,
    private readonly claimJob: (
      client: Client,
      leaseToken: string
    ) => Promise<Claim[]> = claim
  ) {}

  get isClosed(): boolean {
    return this.closed;
  }

  get backgroundFailureCount(): number {
    return this.backgroundFailures.length;
  }

  async tryStartOne(): Promise<boolean> {
    if (!this.acceptingClaims) return false;
    const claimOperation = this.claimAndStart();
    this.pendingClaims.add(claimOperation);
    try {
      return await claimOperation;
    } finally {
      this.pendingClaims.delete(claimOperation);
    }
  }

  private async claimAndStart(): Promise<boolean> {
    const leaseToken = randomUUID();
    const [claimed] = await this.claimJob(this.client, leaseToken);
    if (!claimed) return false;
    if (!this.acceptingClaims) {
      if (!(await release(this.client, claimed.job_id, leaseToken))) {
        throw new Error(
          "Candidate worker could not release a pre-handler claim during drain"
        );
      }
      return false;
    }

    const activeWork = this.process(claimed, leaseToken).catch((error) => {
      this.backgroundFailures.push(error);
    });
    this.active.add(activeWork);
    void activeWork.finally(() => this.active.delete(activeWork));
    return true;
  }

  async drain(timeoutMilliseconds = 2000): Promise<void> {
    this.acceptingClaims = false;
    let timeout: NodeJS.Timeout | undefined;
    const deadline = new Promise<never>((_resolve, reject) => {
      timeout = setTimeout(
        () => reject(new Error("Candidate worker drain exceeded its budget")),
        timeoutMilliseconds
      );
    });
    try {
      const settle = async (): Promise<void> => {
        const failures: unknown[] = [];
        const pendingResults = await Promise.allSettled([
          ...this.pendingClaims,
        ]);
        failures.push(
          ...pendingResults
            .filter(
              (result): result is PromiseRejectedResult =>
                result.status === "rejected"
            )
            .map(({ reason }) => reason)
        );

        const activeResults = await Promise.allSettled([...this.active]);
        failures.push(
          ...activeResults
            .filter(
              (result): result is PromiseRejectedResult =>
                result.status === "rejected"
            )
            .map(({ reason }) => reason),
          ...this.backgroundFailures.splice(0)
        );
        if (failures.length) {
          throw new AggregateError(
            failures,
            "Candidate worker encountered errors while draining"
          );
        }
      };
      await Promise.race([settle(), deadline]);
    } finally {
      if (timeout) clearTimeout(timeout);
      await endRoleClient(this.client);
      this.closed = true;
    }
  }

  private async process(claimed: Claim, leaseToken: string): Promise<void> {
    try {
      await this.handler(claimed);
    } catch (error) {
      const failure = await fail(this.client, claimed.job_id, leaseToken);
      if (!failure.accepted) {
        throw new AggregateError(
          [error],
          "Candidate worker lost its lease while recording failure"
        );
      }
      return;
    }

    if (!(await complete(this.client, claimed.job_id, leaseToken))) {
      throw new Error(
        "Candidate worker lost its lease while recording completion"
      );
    }
  }
}

beforeAll(async () => {
  for (const identifier of generatedClusterIdentifiers) {
    quoteIdentifier(identifier);
  }
  quoteIdentifier(appSchema);
  quoteIdentifier(jobSchema);

  bootstrapConnectionString = loadDatabaseUrl();
  const parsedBootstrapUrl = assertSafeBootstrapTarget(
    bootstrapConnectionString
  );
  await assertLoopbackResolution(parsedBootstrapUrl.hostname);
  const adminClient = new Client({
    connectionString: bootstrapConnectionString,
    connectionTimeoutMillis: 2000,
  });
  await adminClient.connect();
  bootstrap = adminClient;

  const server = await bootstrap.query<{
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
    throw new Error(
      "The Phase 2 worker candidate evaluation requires PostgreSQL 17"
    );
  }
  if (!metadata.superuser) {
    throw new Error(
      "The Phase 2 worker candidate evaluation requires the local test bootstrap superuser"
    );
  }
  if (
    metadata.currentDatabase !== expectedBootstrapDatabase ||
    metadata.currentUser !== expectedBootstrapRole ||
    metadata.serverPort !== Number(expectedDatabasePort)
  ) {
    throw new Error(
      "The connected PostgreSQL server does not match the exact loopback Compose target"
    );
  }

  normalMigrationSnapshot = await readNormalMigrationSnapshot(bootstrap);

  for (const { role, password } of [
    { role: migrationRole, password: null },
    { role: apiRole, password: apiPassword },
    { role: workerRole, password: workerPassword },
  ]) {
    const loginClause = password
      ? `LOGIN PASSWORD ${quoteLiteral(password)}`
      : "NOLOGIN";
    await bootstrap.query(`CREATE ROLE ${quoteIdentifier(role)}
      ${loginClause} NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE
      NOREPLICATION NOBYPASSRLS`);
    createdRoles.push(role);
  }

  await bootstrap.query(
    `CREATE DATABASE ${quoteIdentifier(candidateDatabase)}
       OWNER ${quoteIdentifier(migrationRole)}
       TEMPLATE template0
       ENCODING 'UTF8'`
  );
  databaseCreated = true;

  const candidateUrl = new URL(parsedBootstrapUrl);
  candidateUrl.pathname = `/${candidateDatabase}`;
  candidateConnectionString = candidateUrl.toString();
  const candidateAdminClient = new Client({
    connectionString: candidateConnectionString,
    connectionTimeoutMillis: 2000,
  });
  await candidateAdminClient.connect();
  candidateAdmin = candidateAdminClient;

  await candidateAdmin.query(
    `SET SESSION AUTHORIZATION ${quoteIdentifier(migrationRole)}`
  );
  let migrationOpen = false;
  try {
    await candidateAdmin.query("BEGIN");
    migrationOpen = true;
    await candidateAdmin.query(await renderMigration());
    await candidateAdmin.query("COMMIT");
    migrationOpen = false;
  } finally {
    if (migrationOpen) await candidateAdmin.query("ROLLBACK");
    await candidateAdmin.query("RESET SESSION AUTHORIZATION");
  }

  apiClient = await connectAs(apiRole, apiPassword);
  workerOne = await connectAs(workerRole, workerPassword);
  workerTwo = await connectAs(workerRole, workerPassword);
}, 30_000);

beforeEach(async () => {
  if (!candidateAdmin) throw new Error("Candidate database is not ready");
  await candidateAdmin.query(
    `TRUNCATE TABLE
       ${quoteIdentifier(jobSchema)}.job,
       ${quoteIdentifier(appSchema)}.domain_intent`
  );
});

afterAll(async () => {
  const cleanupErrors: unknown[] = [];
  const cleanupDeadlineAt = Date.now() + 25_000;
  const remainingCleanupTime = (requestedMilliseconds: number): number =>
    Math.max(
      1,
      Math.min(requestedMilliseconds, cleanupDeadlineAt - Date.now())
    );
  const cleanup = (
    action: () => Promise<unknown>,
    timeoutMilliseconds = 3000
  ): Promise<void> =>
    attemptCleanup(
      cleanupErrors,
      action,
      timeoutMilliseconds,
      cleanupDeadlineAt
    );

  for (const client of [...auxiliaryClients, apiClient, workerOne, workerTwo]) {
    await cleanup(() => endRoleClient(client));
  }
  if (candidateAdmin) {
    await cleanup(() => candidateAdmin!.end());
  }
  const needsCleanupAdmin = Boolean(
    normalMigrationSnapshot || databaseCreated || createdRoles.length
  );
  let cleanupAdmin = bootstrap;
  if (cleanupAdmin) {
    try {
      await withTimeout(
        () => cleanupAdmin!.query("SELECT 1"),
        remainingCleanupTime(2000),
        "Candidate cleanup bootstrap probe timed out"
      );
    } catch (error) {
      cleanupErrors.push(error);
      await cleanup(() => cleanupAdmin!.end());
      cleanupAdmin = undefined;
    }
  }
  if (!cleanupAdmin && bootstrapConnectionString && needsCleanupAdmin) {
    const fallbackAdmin = new Client({
      connectionString: bootstrapConnectionString,
      connectionTimeoutMillis: remainingCleanupTime(2000),
    });
    try {
      await withTimeout(
        () => fallbackAdmin.connect(),
        remainingCleanupTime(2500),
        "Candidate cleanup fallback connection timed out"
      );
      cleanupAdmin = fallbackAdmin;
    } catch (error) {
      cleanupErrors.push(error);
      await cleanup(() => fallbackAdmin.end());
    }
  }

  if (cleanupAdmin) {
    try {
      if (normalMigrationSnapshot) {
        await cleanup(async () => {
          const finalSnapshot = await readNormalMigrationSnapshot(
            cleanupAdmin!
          );
          if (finalSnapshot !== normalMigrationSnapshot) {
            throw new Error(
              "The isolated candidate evaluation changed the normal Prisma migration ledger"
            );
          }
        });
      }
      await cleanup(() => cleanupAdmin!.query("SET lock_timeout = '2s'"));
      await cleanup(() => cleanupAdmin!.query("SET statement_timeout = '10s'"));
      if (databaseCreated) {
        await cleanup(
          () =>
            cleanupAdmin!.query(
              `DROP DATABASE IF EXISTS ${quoteIdentifier(candidateDatabase)} WITH (FORCE)`
            ),
          12_000
        );
      }
      for (const role of [...createdRoles].reverse()) {
        await cleanup(() =>
          cleanupAdmin!.query(`DROP OWNED BY ${quoteIdentifier(role)}`)
        );
        await cleanup(() =>
          cleanupAdmin!.query(`DROP ROLE IF EXISTS ${quoteIdentifier(role)}`)
        );
      }

      await cleanup(async () => {
        const remnants = await cleanupAdmin!.query<{
          databases: number;
          roles: number;
        }>(
          `SELECT
             (
               SELECT count(*)::integer
               FROM pg_catalog.pg_database
               WHERE datname = $1
             ) AS databases,
             (
               SELECT count(*)::integer
               FROM pg_catalog.pg_roles
               WHERE rolname = ANY($2::text[])
             ) AS roles`,
          [candidateDatabase, [migrationRole, apiRole, workerRole]]
        );
        if (
          remnants.rows[0]?.databases !== 0 ||
          remnants.rows[0]?.roles !== 0
        ) {
          throw new Error(
            "Phase 2 candidate cleanup left a temporary database or role"
          );
        }
      });
    } finally {
      await cleanup(() => cleanupAdmin!.end());
    }
  } else if (databaseCreated || createdRoles.length) {
    cleanupErrors.push(
      new Error(
        "Phase 2 candidate cleanup could not obtain a bootstrap connection"
      )
    );
  }

  if (cleanupErrors.length) {
    throw new AggregateError(
      cleanupErrors,
      "Phase 2 worker candidate evaluation could not clean every temporary resource"
    );
  }
}, 30_000);

describe.sequential("Phase 2 application-owned worker candidate", () => {
  it("rejects unsafe bootstrap targets before any candidate DDL", () => {
    for (const unsafeTarget of [
      "postgresql://pumdoki:local@remote.example:5432/pumdoki_dev",
      "postgresql://pumdoki:local@localhost:5432/pumdoki_dev?host=remote.example",
      "postgresql://pumdoki:local@localhost:6543/pumdoki_dev",
      "postgresql://other:local@localhost:5432/pumdoki_dev",
      "postgresql://pumdoki:local@localhost:5432/other_dev",
    ]) {
      expect(() => assertSafeBootstrapTarget(unsafeTarget)).toThrow();
    }
  });

  it("applies the isolated migration under its owner and grants exact candidate-database privileges", async () => {
    if (!bootstrap || !candidateAdmin || !apiClient || !workerOne) {
      throw new Error("Candidate fixture is not ready");
    }

    const databaseOwner = await bootstrap.query<{ owner: string }>(
      `SELECT pg_catalog.pg_get_userbyid(datdba) AS owner
       FROM pg_catalog.pg_database
       WHERE datname = $1`,
      [candidateDatabase]
    );
    expect(databaseOwner.rows).toEqual([{ owner: migrationRole }]);

    const ownership = await candidateAdmin.query<{
      objectType: string;
      owner: string;
    }>(
      `SELECT 'schema'::text AS "objectType",
              pg_catalog.pg_get_userbyid(namespace.nspowner) AS owner
       FROM pg_catalog.pg_namespace AS namespace
       WHERE namespace.nspname = ANY($1::text[])
       UNION ALL
       SELECT 'table'::text AS "objectType",
              pg_catalog.pg_get_userbyid(class.relowner) AS owner
       FROM pg_catalog.pg_class AS class
       JOIN pg_catalog.pg_namespace AS namespace
         ON namespace.oid = class.relnamespace
       WHERE namespace.nspname = ANY($1::text[])
         AND class.relkind = 'r'
       UNION ALL
       SELECT 'function'::text AS "objectType",
              pg_catalog.pg_get_userbyid(proc.proowner) AS owner
       FROM pg_catalog.pg_proc AS proc
       JOIN pg_catalog.pg_namespace AS namespace
         ON namespace.oid = proc.pronamespace
       WHERE namespace.nspname = $2`,
      [[appSchema, jobSchema], jobSchema]
    );
    expect(ownership.rows).toHaveLength(10);
    expect(new Set(ownership.rows.map(({ owner }) => owner))).toEqual(
      new Set([migrationRole])
    );

    const indexes = await candidateAdmin.query<{
      indexName: string;
      indexDefinition: string;
    }>(
      `SELECT
         indexname AS "indexName",
         indexdef AS "indexDefinition"
       FROM pg_catalog.pg_indexes
       WHERE schemaname = $1
         AND indexname = ANY($2::text[])
       ORDER BY indexname`,
      [jobSchema, ["job_claim_order_idx", "job_expired_lease_idx"]]
    );
    expect(indexes.rows.map(({ indexName }) => indexName)).toEqual([
      "job_claim_order_idx",
      "job_expired_lease_idx",
    ]);
    expect(
      indexes.rows.find(
        ({ indexName }) => indexName === "job_expired_lease_idx"
      )?.indexDefinition
    ).toMatch(/\(lease_expires_at, id\).*WHERE \(status = 'RUNNING'/);

    const routines = await candidateAdmin.query<{
      securityDefiner: boolean;
      settings: string[] | null;
    }>(
      `SELECT
         proc.prosecdef AS "securityDefiner",
         proc.proconfig AS settings
       FROM pg_catalog.pg_proc AS proc
       JOIN pg_catalog.pg_namespace AS namespace
         ON namespace.oid = proc.pronamespace
       WHERE namespace.nspname = $1`,
      [jobSchema]
    );
    expect(routines.rows).toHaveLength(6);
    for (const routine of routines.rows) {
      expect(routine.securityDefiner).toBe(true);
      expect(routine.settings).toContain("search_path=pg_catalog");
    }

    const roleAttributes = await bootstrap.query<{
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
        canLogin: role.role !== migrationRole,
        inherit: false,
        superuser: false,
        createDatabase: false,
        createRole: false,
        replication: false,
        bypassRls: false,
      });
    }

    const privileges = await candidateAdmin.query<{
      role: string;
      connect: boolean;
      temporary: boolean;
      databaseCreate: boolean;
      appUsage: boolean;
      appCreate: boolean;
      jobUsage: boolean;
      jobCreate: boolean;
      domainSelect: boolean;
      domainInsert: boolean;
      domainUpdate: boolean;
      domainDelete: boolean;
      domainTruncate: boolean;
      domainReferences: boolean;
      domainTrigger: boolean;
      domainMaintain: boolean;
      jobSelect: boolean;
      jobInsert: boolean;
      jobUpdate: boolean;
      jobDelete: boolean;
      jobTruncate: boolean;
      jobReferences: boolean;
      jobTrigger: boolean;
      jobMaintain: boolean;
      enqueueExecute: boolean;
      claimExecute: boolean;
      renewExecute: boolean;
      releaseExecute: boolean;
      completeExecute: boolean;
      failExecute: boolean;
    }>(
      `SELECT
         candidate.role,
         pg_catalog.has_database_privilege(candidate.role, $2, 'CONNECT') AS connect,
         pg_catalog.has_database_privilege(candidate.role, $2, 'TEMPORARY') AS temporary,
         pg_catalog.has_database_privilege(candidate.role, $2, 'CREATE') AS "databaseCreate",
         pg_catalog.has_schema_privilege(candidate.role, $3, 'USAGE') AS "appUsage",
         pg_catalog.has_schema_privilege(candidate.role, $3, 'CREATE') AS "appCreate",
         pg_catalog.has_schema_privilege(candidate.role, $4, 'USAGE') AS "jobUsage",
         pg_catalog.has_schema_privilege(candidate.role, $4, 'CREATE') AS "jobCreate",
         pg_catalog.has_table_privilege(candidate.role, $5, 'SELECT') AS "domainSelect",
         pg_catalog.has_table_privilege(candidate.role, $5, 'INSERT') AS "domainInsert",
         pg_catalog.has_table_privilege(candidate.role, $5, 'UPDATE') AS "domainUpdate",
         pg_catalog.has_table_privilege(candidate.role, $5, 'DELETE') AS "domainDelete",
         pg_catalog.has_table_privilege(candidate.role, $5, 'TRUNCATE') AS "domainTruncate",
         pg_catalog.has_table_privilege(candidate.role, $5, 'REFERENCES') AS "domainReferences",
         pg_catalog.has_table_privilege(candidate.role, $5, 'TRIGGER') AS "domainTrigger",
         pg_catalog.has_table_privilege(candidate.role, $5, 'MAINTAIN') AS "domainMaintain",
         pg_catalog.has_table_privilege(candidate.role, $6, 'SELECT') AS "jobSelect",
         pg_catalog.has_table_privilege(candidate.role, $6, 'INSERT') AS "jobInsert",
         pg_catalog.has_table_privilege(candidate.role, $6, 'UPDATE') AS "jobUpdate",
         pg_catalog.has_table_privilege(candidate.role, $6, 'DELETE') AS "jobDelete",
         pg_catalog.has_table_privilege(candidate.role, $6, 'TRUNCATE') AS "jobTruncate",
         pg_catalog.has_table_privilege(candidate.role, $6, 'REFERENCES') AS "jobReferences",
         pg_catalog.has_table_privilege(candidate.role, $6, 'TRIGGER') AS "jobTrigger",
         pg_catalog.has_table_privilege(candidate.role, $6, 'MAINTAIN') AS "jobMaintain",
         pg_catalog.has_function_privilege(candidate.role, $7, 'EXECUTE') AS "enqueueExecute",
         pg_catalog.has_function_privilege(candidate.role, $8, 'EXECUTE') AS "claimExecute",
         pg_catalog.has_function_privilege(candidate.role, $9, 'EXECUTE') AS "renewExecute",
         pg_catalog.has_function_privilege(candidate.role, $10, 'EXECUTE') AS "releaseExecute",
         pg_catalog.has_function_privilege(candidate.role, $11, 'EXECUTE') AS "completeExecute",
         pg_catalog.has_function_privilege(candidate.role, $12, 'EXECUTE') AS "failExecute"
       FROM unnest($1::text[]) AS candidate(role)
       ORDER BY candidate.role`,
      [
        [apiRole, workerRole],
        candidateDatabase,
        appSchema,
        jobSchema,
        `${appSchema}.domain_intent`,
        `${jobSchema}.job`,
        `${jobSchema}.enqueue_canary(uuid,uuid,text)`,
        `${jobSchema}.claim_canary(uuid)`,
        `${jobSchema}.renew_canary(uuid,uuid)`,
        `${jobSchema}.release_canary(uuid,uuid)`,
        `${jobSchema}.complete_canary(uuid,uuid)`,
        `${jobSchema}.fail_canary(uuid,uuid,text)`,
      ]
    );
    expect(privileges.rows).toEqual([
      {
        role: apiRole,
        connect: true,
        temporary: false,
        databaseCreate: false,
        appUsage: true,
        appCreate: false,
        jobUsage: true,
        jobCreate: false,
        domainSelect: false,
        domainInsert: true,
        domainUpdate: false,
        domainDelete: false,
        domainTruncate: false,
        domainReferences: false,
        domainTrigger: false,
        domainMaintain: false,
        jobSelect: false,
        jobInsert: false,
        jobUpdate: false,
        jobDelete: false,
        jobTruncate: false,
        jobReferences: false,
        jobTrigger: false,
        jobMaintain: false,
        enqueueExecute: true,
        claimExecute: false,
        renewExecute: false,
        releaseExecute: false,
        completeExecute: false,
        failExecute: false,
      },
      {
        role: workerRole,
        connect: true,
        temporary: false,
        databaseCreate: false,
        appUsage: true,
        appCreate: false,
        jobUsage: true,
        jobCreate: false,
        domainSelect: true,
        domainInsert: false,
        domainUpdate: false,
        domainDelete: false,
        domainTruncate: false,
        domainReferences: false,
        domainTrigger: false,
        domainMaintain: false,
        jobSelect: false,
        jobInsert: false,
        jobUpdate: false,
        jobDelete: false,
        jobTruncate: false,
        jobReferences: false,
        jobTrigger: false,
        jobMaintain: false,
        enqueueExecute: false,
        claimExecute: true,
        renewExecute: true,
        releaseExecute: true,
        completeExecute: true,
        failExecute: true,
      },
    ]);

    await expect(
      apiClient.query(`SET ROLE ${quoteIdentifier(migrationRole)}`)
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      workerOne.query(`SET ROLE ${quoteIdentifier(migrationRole)}`)
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      apiClient.query(`SET ROLE ${quoteIdentifier(workerRole)}`)
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      workerOne.query(`SET ROLE ${quoteIdentifier(apiRole)}`)
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      apiClient.query(`SELECT * FROM ${quoteIdentifier(jobSchema)}.job`)
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      apiClient.query(
        `SELECT * FROM ${quoteIdentifier(jobSchema)}.claim_canary($1::uuid)`,
        [randomUUID()]
      )
    ).rejects.toMatchObject({ code: "42501" });
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
        `SELECT ${quoteIdentifier(jobSchema)}.enqueue_canary(
           $1::uuid,
           $2::uuid,
           'forbidden'
         )`,
        [randomUUID(), randomUUID()]
      )
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("rejects null required inputs through the allowlisted routine boundary", async () => {
    if (!apiClient || !workerOne) {
      throw new Error("Candidate fixture is not ready");
    }
    await expect(
      apiClient.query(
        `SELECT ${quoteIdentifier(jobSchema)}.enqueue_canary(
           $1::uuid,
           $2::uuid,
           NULL::text
         )`,
        [randomUUID(), randomUUID()]
      )
    ).rejects.toMatchObject({ code: "22023" });
    await expect(
      workerOne.query(
        `SELECT * FROM ${quoteIdentifier(jobSchema)}.claim_canary(NULL::uuid)`
      )
    ).rejects.toMatchObject({ code: "22023" });
    for (const routine of [
      "renew_canary",
      "release_canary",
      "complete_canary",
    ]) {
      await expect(
        workerOne.query(
          `SELECT ${quoteIdentifier(jobSchema)}.${routine}(
             $1::uuid,
             NULL::uuid
           )`,
          [randomUUID()]
        )
      ).rejects.toMatchObject({ code: "22023" });
    }
    await expect(
      workerOne.query(
        `SELECT * FROM ${quoteIdentifier(jobSchema)}.fail_canary(
           $1::uuid,
           $2::uuid,
           NULL::text
         )`,
        [randomUUID(), randomUUID()]
      )
    ).rejects.toMatchObject({ code: "22023" });
  });

  it("fences claim, renewal, completion, and failure with opaque lease tokens", async () => {
    if (!candidateAdmin || !workerOne || !workerTwo) {
      throw new Error("Candidate fixture is not ready");
    }
    const { jobId } = await enqueueCanary({
      description: "Lease fencing candidate",
      dedupeKey: `lease-${suffix}`,
    });
    const staleToken = randomUUID();
    const currentToken = randomUUID();

    expect(await claim(workerOne, staleToken)).toMatchObject([
      { job_id: jobId, attempt_count: 1 },
    ]);
    expect(await renew(workerOne, jobId, randomUUID())).toBe(false);
    expect(await renew(workerOne, jobId, staleToken)).toBe(true);

    await candidateAdmin.query(
      `UPDATE ${quoteIdentifier(jobSchema)}.job
       SET lease_expires_at = pg_catalog.clock_timestamp() - interval '1 second'
       WHERE id = $1::uuid`,
      [jobId]
    );
    expect(await claim(workerTwo, currentToken)).toMatchObject([
      { job_id: jobId, attempt_count: 2 },
    ]);

    expect(await renew(workerOne, jobId, staleToken)).toBe(false);
    expect(await release(workerOne, jobId, staleToken)).toBe(false);
    expect(await complete(workerOne, jobId, staleToken)).toBe(false);
    expect((await fail(workerOne, jobId, staleToken)).accepted).toBe(false);
    expect(await renew(workerTwo, jobId, currentToken)).toBe(true);
    expect(await release(workerTwo, jobId, currentToken)).toBe(true);
    const finalToken = randomUUID();
    expect(await claim(workerTwo, finalToken)).toMatchObject([
      { job_id: jobId, attempt_count: 2 },
    ]);
    expect(await complete(workerTwo, jobId, currentToken)).toBe(false);
    expect(await complete(workerTwo, jobId, finalToken)).toBe(true);

    const finalState = await candidateAdmin.query<{
      status: string;
      attemptCount: number;
      leaseToken: string | null;
    }>(
      `SELECT
         status,
         attempt_count AS "attemptCount",
         lease_token AS "leaseToken"
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = $1::uuid`,
      [jobId]
    );
    expect(finalState.rows).toEqual([
      { status: "SUCCEEDED", attemptCount: 2, leaseToken: null },
    ]);
  });

  it("keeps a pre-handler safe release neutral to the delivery-attempt budget", async () => {
    if (!candidateAdmin || !workerOne) {
      throw new Error("Candidate fixture is not ready");
    }
    const { jobId } = await enqueueCanary({
      description: "Attempt-neutral release candidate",
      dedupeKey: `release-neutral-${suffix}`,
    });

    for (let reservation = 0; reservation < 4; reservation += 1) {
      const leaseToken = randomUUID();
      expect(await claim(workerOne, leaseToken)).toMatchObject([
        { job_id: jobId, attempt_count: 1 },
      ]);
      expect(await release(workerOne, jobId, leaseToken)).toBe(true);

      const pending = await candidateAdmin.query<{
        status: string;
        attemptCount: number;
        leaseToken: string | null;
      }>(
        `SELECT
           status,
           attempt_count AS "attemptCount",
           lease_token AS "leaseToken"
         FROM ${quoteIdentifier(jobSchema)}.job
         WHERE id = $1::uuid`,
        [jobId]
      );
      expect(pending.rows).toEqual([
        { status: "PENDING", attemptCount: 0, leaseToken: null },
      ]);
    }

    const finalToken = randomUUID();
    expect(await claim(workerOne, finalToken)).toMatchObject([
      { job_id: jobId, attempt_count: 1 },
    ]);
    expect(await complete(workerOne, jobId, finalToken)).toBe(true);
  });

  it("uses bounded exponential retry delays and terminates exhausted work as DEAD", async () => {
    if (!candidateAdmin || !workerOne) {
      throw new Error("Candidate fixture is not ready");
    }
    const { jobId } = await enqueueCanary({
      description: "Retry candidate",
      dedupeKey: `retry-${suffix}`,
    });

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const leaseToken = randomUUID();
      expect(await claim(workerOne, leaseToken)).toMatchObject([
        { job_id: jobId, attempt_count: attempt },
      ]);
      const failure = await fail(workerOne, jobId, leaseToken);
      expect(failure.accepted).toBe(true);

      const state = await candidateAdmin.query<{
        status: string;
        attemptCount: number;
        delayMilliseconds: number | null;
        completed: boolean;
        failureCategory: string | null;
      }>(
        `SELECT
           status,
           attempt_count AS "attemptCount",
           CASE
             WHEN status = 'PENDING'
             THEN EXTRACT(EPOCH FROM (available_at - updated_at)) * 1000
             ELSE NULL
           END::double precision AS "delayMilliseconds",
           completed_at IS NOT NULL AS completed,
           last_failure_category AS "failureCategory"
         FROM ${quoteIdentifier(jobSchema)}.job
         WHERE id = $1::uuid`,
        [jobId]
      );

      if (attempt < 3) {
        expect(failure.job_status).toBe("PENDING");
        expect(failure.retry_at).toBeInstanceOf(Date);
        expect(state.rows[0]).toMatchObject({
          status: "PENDING",
          attemptCount: attempt,
          completed: false,
          failureCategory: "transient",
        });
        const nominalDelay = 100 * 2 ** (attempt - 1);
        expect(state.rows[0]!.delayMilliseconds).toBeGreaterThanOrEqual(
          Math.floor(nominalDelay * 0.75) - 1
        );
        expect(state.rows[0]!.delayMilliseconds).toBeLessThanOrEqual(
          Math.floor(nominalDelay * 1.25) + 1
        );
        expect(await claim(workerOne, randomUUID())).toEqual([]);
        await candidateAdmin.query(
          `UPDATE ${quoteIdentifier(jobSchema)}.job
           SET available_at = pg_catalog.clock_timestamp() - interval '1 second'
           WHERE id = $1::uuid`,
          [jobId]
        );
      } else {
        expect(failure).toMatchObject({
          accepted: true,
          job_status: "DEAD",
          retry_at: null,
        });
        expect(state.rows).toEqual([
          {
            status: "DEAD",
            attemptCount: 3,
            delayMilliseconds: null,
            completed: true,
            failureCategory: "transient",
          },
        ]);
      }
    }

    expect(await claim(workerOne, randomUUID())).toEqual([]);
  });

  it("terminalizes a permanent failure on its first attempt", async () => {
    if (!candidateAdmin || !workerOne) {
      throw new Error("Candidate fixture is not ready");
    }
    const { jobId } = await enqueueCanary({
      description: "Permanent failure candidate",
      dedupeKey: `permanent-${suffix}`,
    });
    const leaseToken = randomUUID();
    expect(await claim(workerOne, leaseToken)).toMatchObject([
      { job_id: jobId, attempt_count: 1 },
    ]);
    expect(await fail(workerOne, jobId, leaseToken, "permanent")).toMatchObject(
      {
        accepted: true,
        job_status: "DEAD",
        retry_at: null,
      }
    );
    expect(await claim(workerOne, randomUUID())).toEqual([]);

    const state = await candidateAdmin.query<{
      status: string;
      attemptCount: number;
      failureCategory: string;
    }>(
      `SELECT
         status,
         attempt_count AS "attemptCount",
         last_failure_category AS "failureCategory"
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = $1::uuid`,
      [jobId]
    );
    expect(state.rows).toEqual([
      { status: "DEAD", attemptCount: 1, failureCategory: "permanent" },
    ]);
  });

  it("moves an expired final attempt to DEAD instead of stranding RUNNING work", async () => {
    if (!candidateAdmin || !workerOne || !workerTwo) {
      throw new Error("Candidate fixture is not ready");
    }
    const { jobId } = await enqueueCanary({
      description: "Expired attempt-limit candidate",
      dedupeKey: `expired-limit-${suffix}`,
    });
    await candidateAdmin.query(
      `UPDATE ${quoteIdentifier(jobSchema)}.job
       SET max_attempts = 1
       WHERE id = $1::uuid`,
      [jobId]
    );
    const expiredToken = randomUUID();
    expect(await claim(workerOne, expiredToken)).toMatchObject([
      { job_id: jobId, attempt_count: 1 },
    ]);
    await candidateAdmin.query(
      `UPDATE ${quoteIdentifier(jobSchema)}.job
       SET lease_expires_at = pg_catalog.clock_timestamp() - interval '1 second'
       WHERE id = $1::uuid`,
      [jobId]
    );

    expect(await claim(workerTwo, randomUUID())).toEqual([]);
    expect(await renew(workerOne, jobId, expiredToken)).toBe(false);
    expect(await release(workerOne, jobId, expiredToken)).toBe(false);
    expect(await complete(workerOne, jobId, expiredToken)).toBe(false);
    expect((await fail(workerOne, jobId, expiredToken)).accepted).toBe(false);

    const terminal = await candidateAdmin.query<{
      status: string;
      attemptCount: number;
      failureCategory: string;
      completed: boolean;
    }>(
      `SELECT
         status,
         attempt_count AS "attemptCount",
         last_failure_category AS "failureCategory",
         completed_at IS NOT NULL AS completed
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = $1::uuid`,
      [jobId]
    );
    expect(terminal.rows).toEqual([
      {
        status: "DEAD",
        attemptCount: 1,
        failureCategory: "lease-expired-attempt-limit",
        completed: true,
      },
    ]);
  });

  it("skips a locked terminalizable row and still claims unrelated work", async () => {
    if (!candidateAdmin || !workerOne || !workerTwo) {
      throw new Error("Candidate fixture is not ready");
    }
    const expired = await enqueueCanary({
      description: "Locked expired candidate",
      dedupeKey: `locked-expired-${suffix}`,
    });
    await candidateAdmin.query(
      `UPDATE ${quoteIdentifier(jobSchema)}.job
       SET max_attempts = 1
       WHERE id = $1::uuid`,
      [expired.jobId]
    );
    expect(await claim(workerOne, randomUUID())).toMatchObject([
      { job_id: expired.jobId, attempt_count: 1 },
    ]);
    await candidateAdmin.query(
      `UPDATE ${quoteIdentifier(jobSchema)}.job
       SET lease_expires_at = pg_catalog.clock_timestamp() - interval '1 second'
       WHERE id = $1::uuid`,
      [expired.jobId]
    );
    const available = await enqueueCanary({
      description: "Unlocked pending candidate",
      dedupeKey: `unlocked-pending-${suffix}`,
    });
    const availableToken = randomUUID();

    await candidateAdmin.query("BEGIN");
    try {
      await candidateAdmin.query(
        `SELECT id
         FROM ${quoteIdentifier(jobSchema)}.job
         WHERE id = $1::uuid
         FOR UPDATE`,
        [expired.jobId]
      );
      await workerTwo.query("SET statement_timeout = '2s'");
      expect(await claim(workerTwo, availableToken)).toMatchObject([
        { job_id: available.jobId, attempt_count: 1 },
      ]);
    } finally {
      await candidateAdmin.query("ROLLBACK");
      await workerTwo.query("RESET statement_timeout");
    }

    expect(await complete(workerTwo, available.jobId, availableToken)).toBe(
      true
    );
    expect(await claim(workerTwo, randomUUID())).toEqual([]);
    const expiredState = await candidateAdmin.query<{ status: string }>(
      `SELECT status
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = $1::uuid`,
      [expired.jobId]
    );
    expect(expiredState.rows).toEqual([{ status: "DEAD" }]);
  });

  it("drains active work within budget and stops accepting new claims", async () => {
    if (!candidateAdmin) throw new Error("Candidate fixture is not ready");
    const first = await enqueueCanary({
      description: "Active graceful-drain candidate",
      dedupeKey: `drain-active-${suffix}`,
    });
    const second = await enqueueCanary({
      description: "Pending graceful-drain candidate",
      dedupeKey: `drain-pending-${suffix}`,
    });

    let releaseHandler!: () => void;
    const handlerGate = new Promise<void>((resolve) => {
      releaseHandler = resolve;
    });
    let handlerStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      handlerStarted = resolve;
    });
    const drainClient = await connectAs(workerRole, workerPassword);
    auxiliaryClients.add(drainClient);
    const worker = new DrainingCandidateWorker(drainClient, async () => {
      handlerStarted();
      await handlerGate;
    });

    expect(await worker.tryStartOne()).toBe(true);
    await started;
    let drained = false;
    const draining = worker.drain(2000).then(() => {
      drained = true;
    });
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(drained).toBe(false);
    expect(await worker.tryStartOne()).toBe(false);

    releaseHandler();
    await draining;
    expect(worker.isClosed).toBe(true);

    const states = await candidateAdmin.query<{
      id: string;
      status: string;
      attemptCount: number;
    }>(
      `SELECT id, status, attempt_count AS "attemptCount"
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = ANY($1::uuid[])
       ORDER BY id`,
      [[first.jobId, second.jobId]]
    );
    expect(new Map(states.rows.map((row) => [row.id, row]))).toEqual(
      new Map([
        [
          first.jobId,
          { id: first.jobId, status: "SUCCEEDED", attemptCount: 1 },
        ],
        [
          second.jobId,
          { id: second.jobId, status: "PENDING", attemptCount: 0 },
        ],
      ])
    );
  });

  it("waits for every active handler before reporting a drain failure", async () => {
    if (!candidateAdmin) throw new Error("Candidate fixture is not ready");
    const failing = await enqueueCanary({
      description: "Failing drain candidate",
      dedupeKey: `drain-failing-${suffix}`,
    });
    const surviving = await enqueueCanary({
      description: "Surviving drain candidate",
      dedupeKey: `drain-surviving-${suffix}`,
    });

    let handlersStarted = 0;
    let signalBothStarted!: () => void;
    const bothStarted = new Promise<void>((resolve) => {
      signalBothStarted = resolve;
    });
    const markStarted = (): void => {
      handlersStarted += 1;
      if (handlersStarted === 2) signalBothStarted();
    };
    let releaseFailing!: () => void;
    const failingGate = new Promise<void>((resolve) => {
      releaseFailing = resolve;
    });
    let releaseSurviving!: () => void;
    const survivingGate = new Promise<void>((resolve) => {
      releaseSurviving = resolve;
    });
    const drainClient = await connectAs(workerRole, workerPassword);
    auxiliaryClients.add(drainClient);
    const worker = new DrainingCandidateWorker(drainClient, async (claimed) => {
      markStarted();
      if (claimed.job_id === failing.jobId) {
        await failingGate;
        await candidateAdmin!.query(
          `UPDATE ${quoteIdentifier(jobSchema)}.job
           SET lease_expires_at = pg_catalog.clock_timestamp() - interval '1 second'
           WHERE id = $1::uuid`,
          [claimed.job_id]
        );
        throw new Error("Synthetic handler failure after lease loss");
      }
      if (claimed.job_id !== surviving.jobId) {
        throw new Error("Candidate drain claimed an unexpected job");
      }
      await survivingGate;
    });

    expect(await worker.tryStartOne()).toBe(true);
    expect(await worker.tryStartOne()).toBe(true);
    await bothStarted;

    let drainSettled = false;
    const draining = worker.drain(2000).then(
      () => {
        drainSettled = true;
        return undefined;
      },
      (error: unknown) => {
        drainSettled = true;
        return error;
      }
    );
    releaseFailing();
    await expect
      .poll(() => worker.backgroundFailureCount, { timeout: 1000 })
      .toBe(1);
    expect(drainSettled).toBe(false);

    releaseSurviving();
    const drainError = await draining;
    expect(drainError).toBeInstanceOf(AggregateError);
    expect(worker.isClosed).toBe(true);

    const survivingState = await candidateAdmin.query<{ status: string }>(
      `SELECT status
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = $1::uuid`,
      [surviving.jobId]
    );
    expect(survivingState.rows).toEqual([{ status: "SUCCEEDED" }]);
  });

  it("waits for an in-flight claim and releases it before drain closes", async () => {
    if (!candidateAdmin) throw new Error("Candidate fixture is not ready");
    const queued = await enqueueCanary({
      description: "Claim-versus-drain candidate",
      dedupeKey: `claim-drain-${suffix}`,
    });
    let claimEntered!: () => void;
    const entered = new Promise<void>((resolve) => {
      claimEntered = resolve;
    });
    let allowClaim!: () => void;
    const claimGate = new Promise<void>((resolve) => {
      allowClaim = resolve;
    });
    let handlerRan = false;
    const raceClient = await connectAs(workerRole, workerPassword);
    auxiliaryClients.add(raceClient);
    const worker = new DrainingCandidateWorker(
      raceClient,
      async () => {
        handlerRan = true;
      },
      async (client, leaseToken) => {
        claimEntered();
        await claimGate;
        return claim(client, leaseToken);
      }
    );

    const starting = worker.tryStartOne();
    await entered;
    const draining = worker.drain(2000);
    allowClaim();
    expect(await starting).toBe(false);
    await draining;
    expect(handlerRan).toBe(false);
    expect(worker.isClosed).toBe(true);

    const state = await candidateAdmin.query<{
      status: string;
      attemptCount: number;
      leaseToken: string | null;
    }>(
      `SELECT
         status,
         attempt_count AS "attemptCount",
         lease_token AS "leaseToken"
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = $1::uuid`,
      [queued.jobId]
    );
    expect(state.rows).toEqual([
      { status: "PENDING", attemptCount: 0, leaseToken: null },
    ]);
  });

  it("leaves uncertain work leased until expiry and rejects the crashed worker token", async () => {
    if (!candidateAdmin || !workerTwo) {
      throw new Error("Candidate fixture is not ready");
    }
    const { jobId } = await enqueueCanary({
      description: "Forced shutdown candidate",
      dedupeKey: `forced-${suffix}`,
    });
    const crashedToken = randomUUID();
    const recoveredToken = randomUUID();
    const crashedClient = await connectAs(workerRole, workerPassword);
    auxiliaryClients.add(crashedClient);

    expect(await claim(crashedClient, crashedToken)).toMatchObject([
      { job_id: jobId, attempt_count: 1 },
    ]);
    await endRoleClient(crashedClient);

    const stillLeased = await candidateAdmin.query<{
      status: string;
      leaseToken: string | null;
      leaseStillActive: boolean;
    }>(
      `SELECT
         status,
         lease_token AS "leaseToken",
         lease_expires_at > pg_catalog.clock_timestamp() AS "leaseStillActive"
       FROM ${quoteIdentifier(jobSchema)}.job
       WHERE id = $1::uuid`,
      [jobId]
    );
    expect(stillLeased.rows).toEqual([
      {
        status: "RUNNING",
        leaseToken: crashedToken,
        leaseStillActive: true,
      },
    ]);
    expect(await claim(workerTwo, recoveredToken)).toEqual([]);

    await candidateAdmin.query(
      `UPDATE ${quoteIdentifier(jobSchema)}.job
       SET lease_expires_at = pg_catalog.clock_timestamp() - interval '1 second'
       WHERE id = $1::uuid`,
      [jobId]
    );
    expect(await claim(workerTwo, recoveredToken)).toMatchObject([
      { job_id: jobId, attempt_count: 2 },
    ]);

    expect(await renew(workerTwo, jobId, crashedToken)).toBe(false);
    expect(await release(workerTwo, jobId, crashedToken)).toBe(false);
    expect(await complete(workerTwo, jobId, crashedToken)).toBe(false);
    expect((await fail(workerTwo, jobId, crashedToken)).accepted).toBe(false);
    expect(await complete(workerTwo, jobId, recoveredToken)).toBe(true);
  });
});
