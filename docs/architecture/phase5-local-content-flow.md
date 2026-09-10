# Phase 5 — first local content flow

September 9, 2026. Implemented locally from the earlier
[content/access design](phase5-slice1-content-model-and-access-design.md).
This is a working safe-sample slice, not a Phase 5 exit or a processor-ready site.

## Working behavior

With both content flags enabled, `/home` uses the real API instead of sample
feed posts. A verified `.example` creator uploads up to four PNG/JPEG/MP4 files,
saves a private draft, recovers it after refresh, and publishes it. Verified
test members see published posts and authenticated photo/video responses.
Removing a post prevents subsequent reads, including byte-range requests.
The existing shell and static themes remain; the default prototype is unchanged
when the flag is disabled. A failed real API request never substitutes fixtures.

`ContentPost` is one sealed caption/manifest: this slice has no caption edits,
media replacement, paid offers, or audience changes. `MediaAsset` stores an
opaque private key and the measured MIME, size and SHA-256 of sanitized bytes.
The composite foreign key enforces creator ownership. Database constraints
prevent rewriting sealed values, appending files after publication, restoring
removed posts, or marking these samples as production content. Draft creation
and uploads use actor-scoped request keys; conflicting retries fail. Publish
and removal are repeatable state transitions serialized on the creator row.

The private filesystem adapter survives API process restarts. Image files are
fully decoded/re-encoded with Sharp, stripping metadata, with a 16-megapixel
limit. MP4 processing uses a configured FFmpeg/ffprobe installation, accepts
H.264 with optional AAC, and re-encodes to H.264/AAC with metadata removed.
Video limits are two minutes, 1080p and 20 MiB. Every file is capped at 20 MiB.
Database-recorded quotas are 100 assets per creator, 250 total, and 5 GiB total.
Temporary/orphan files after a process crash can consume additional disk; these
quotas are not a hosting billing cap or a completed retention/cleanup system.

Media is served through the API after current session, account, creator and
post-state checks. Storage paths and keys never enter browser JSON. Reads verify
the stored digest, use `private, no-store`, and do not issue reusable storage
URLs. Anonymous, foreign-draft and removed-content requests are denied. Writes
also require the configured web Origin. No-store revokes future retrieval;
it cannot erase bytes a browser has already received.

## Deliberate boundary

`CONTENT_MODE` defaults to `disabled`. Development content refuses a production
environment or remote web Origin, binds the API to `127.0.0.1`, and accepts only
verified `.example` accounts with MEMBER/CREATOR roles. Safe-file confirmation
is a test-use declaration, not identity verification, consent review or
moderation. Existing dormant operations stay dormant. There is no real creator
approval bypass and no live adult media or money in this slice.

The full design still requires production creator/performer eligibility,
versioned revisions and offers, paid entitlements, explicit classification,
moderation/audit evidence, isolated asynchronous processing, malware handling,
retention and recovery. Native processing here is bounded but runs during local
requests. The canary worker has not become a media worker. These limitations
must be addressed in the relevant implementation before live sensitive use;
they do not reinstate a blanket pre-code review gate.

## Storage decision alongside this slice

The founder selected R2 preparation and requested account setup guidance after
the local flow passes. R2 Standard is the chosen direction for safe review
media. The founder activated R2, created `pumdoki-review-media`, and saved scoped
S3 credentials locally. Safe photo/video integration is now verified against
R2; the bucket overview shows Public Access Disabled. The estimate is $0/month for a
small dataset within its allowance; $5/month is a proposed planning budget,
not approved spending. R2 includes 10 GB-month storage and request allowances;
API hosting, outbound proxy traffic and video processing are separate costs.
[Official R2 pricing](https://developers.cloudflare.com/r2/pricing/).

Cloudflare billing alerts do not stop or cap charges. Use a private bucket,
server-only scoped credentials and application quotas if selected; no public
`r2.dev` endpoint. The founder activated the R2 subscription ($0 due at activation) and created
the review bucket. Actual safe uploads and authenticated cloud reads passed.
The proposed billing alert and recommended 30-day token lifetime remain unverified.
Provider acceptance of the eventual adult business remains unconfirmed.
[Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/),
[private/public bucket controls](https://developers.cloudflare.com/r2/buckets/public-buckets/).

The founder created a bucket-scoped **Object Read & Write** S3
credential, using an Account API token named `pumdoki-local-review`. Its
Access Key ID and Secret Access Key belong in ignored `.env.r2.local`, never
chat, frontend variables or committed files. The filled file passed configuration
validation and provider requests; mode 0600 and Git exclusion were verified.
[Scoped credential instructions](https://developers.cloudflare.com/r2/api/tokens/).

The S3 adapter writes `safe-test/<opaque-key>` objects using
`If-None-Match: *`, Content-MD5, Standard storage and no-store metadata after
local decode/re-encoding. It never publishes object URLs. Bounded private reads
still pass the same application authorization and SHA-256 verification.
SDK failures are normalized without credentials, endpoints or storage keys.
The tenth additive migration persists immutable LOCAL/R2 per asset. Switching
new uploads to R2 preserves existing local reads; missing R2 configuration never
falls back to local bytes for an R2 asset. Offline tests cover these boundaries.
[Supported S3 operations](https://developers.cloudflare.com/r2/api/s3/api/).

With the saved credentials, start the local API from the repository root:

```bash
node --env-file=.env --env-file=.env.r2.local apps/api/dist/server.js
```

It still binds to loopback and accepts only safe test content. Actual R2 PNG/MP4
uploads, digest-matching reads, member draft denial, publication, range delivery,
restart persistence and removal revocation passed. Anonymous app requests
returned 401; unsigned S3 requests returned 400 without media. The dashboard
independently confirmed Public Access Disabled. Both browser tests passed,
including actual video playback. Five generated objects across the verification
runs were explicitly deleted and confirmed absent; existing objects were untouched.
Product removal remains a logical tombstone, not an object-deletion/retention
workflow. Small metered test requests were made; no new subscription or public
hosting was activated. This does not establish production or adult-business
provider acceptance. The next founder step is reviewing the working local flow.

## Local verification and reproduction

Use Node 24.19.0, Docker PostgreSQL/Mailpit, and FFmpeg with sibling ffprobe.
The local machine now has FFmpeg at `/opt/homebrew/bin/ffmpeg`. CI installs
FFmpeg for the API and content browser suites. Windows users supply their
absolute FFmpeg path; the storage adapter resolves sibling `ffprobe.exe`.

The September 9 development database had pre-existing worker-schema drift
(old unhashed canary key columns). No existing data or historical migration was
rewritten. Verification uses the separate database
`pumdoki_content_final_20260909`, created from the repository migrations, now including the tenth storage-backend migration.
The generated migration was reviewed to exclude unrelated drift repairs.

For a new isolated review database, run from the repository root:

```bash
npm run db:up
docker exec pumdoki-db createdb -U pumdoki pumdoki_content_review
export DATABASE_URL=postgresql://pumdoki:pumdoki@127.0.0.1:5432/pumdoki_content_review
npm run build:api
npm run db:deploy
npm run db:seed
export CONTENT_FFMPEG_PATH=/absolute/path/to/ffmpeg
npm run test:api
npm run test:e2e:content
```

Only run `createdb` once for a new name. Do not reset an existing database.
The content Playwright configuration starts its own API on 3180 and browser
app on 5180, checks photos and actual video playback, and stops both afterward.
It does not reuse other running servers. Media test files live under ignored
`tmp/content-e2e-media`; generated screenshots are in ignored `test-results`.

To review manually, use the same DATABASE_URL in two terminals. In the first:

```bash
CONTENT_MODE=development CONTENT_STORAGE_DIRECTORY="$PWD/tmp/content-review-media" CONTENT_FFMPEG_PATH=/absolute/path/to/ffmpeg WEB_ORIGIN=http://127.0.0.1:5180 PORT=3180 npm run dev:api
```

In the second:

```bash
VITE_CONTENT_MODE=development VITE_API_BASE_URL=http://127.0.0.1:3180/api/v1 npm run dev:e2e --workspace @pumdoki/web -- --port 5180 --strictPort
```

Log in as `creator@pumdoki.example`, password `pumdoki-dev-password`.
Use Create Post, select your own safe sample photo/video, save, then Publish.
Use a separate browser session for a member; verify the member email through
local Mailpit before reading content. Stop each server with Ctrl-C. These
credentials are development seeds only.

Verification passed: 388 API tests (one existing opt-in worker privilege test
skipped), 238 web tests, 24 contract tests, 52 legacy browser tests and both
photo/video content browser tests. API/web/admin builds, the focused content
TypeScript check, lint, formatting and diff checks passed. An actual API process
stop/start preserved the post, session and identical video bytes. See HANDOFF.md
for the local checkpoint and remaining hosted-use limitations.
