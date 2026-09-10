import { z } from "zod";
import { isAbsolute } from "node:path";

const WebOriginSchema = z
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.username === "" &&
        url.password === "" &&
        url.pathname === "/" &&
        url.search === "" &&
        url.hash === ""
      );
    } catch {
      return false;
    }
  }, "Must be an HTTP(S) origin without credentials, path, query, or fragment")
  .transform((value) => new URL(value).origin);

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  WEB_ORIGIN: WebOriginSchema.default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  MAIL_TRANSPORT: z.enum(["console", "smtp"]).default("smtp"),
  SMTP_HOST: z.string().min(1).default("localhost"),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(1025),
  MAIL_FROM: z.string().min(1).default("no-reply@pumdoki.example"),
  CONTENT_MODE: z.enum(["disabled", "development"]).default("disabled"),
  CONTENT_STORAGE_BACKEND: z.enum(["LOCAL", "R2"]).default("LOCAL"),
  R2_ACCOUNT_ID: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .string()
      .regex(/^[a-f0-9]{32}$/, "Must be a Cloudflare account ID")
      .optional()
  ),
  R2_BUCKET: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z
      .string()
      .regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, "Must be a bucket name")
      .optional()
  ),
  R2_ACCESS_KEY_ID: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().min(1).optional()
  ),
  R2_SECRET_ACCESS_KEY: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().min(1).optional()
  ),
  CONTENT_STORAGE_DIRECTORY: z
    .string()
    .refine(isAbsolute, "Must be an absolute private directory")
    .optional(),
  CONTENT_FFMPEG_PATH: z
    .string()
    .refine(isAbsolute, "Must be an absolute executable path")
    .optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  if (parsed.data.CONTENT_MODE === "development") {
    if (
      parsed.data.CONTENT_STORAGE_BACKEND === "R2" &&
      (!parsed.data.R2_ACCOUNT_ID ||
        !parsed.data.R2_BUCKET ||
        !parsed.data.R2_ACCESS_KEY_ID ||
        !parsed.data.R2_SECRET_ACCESS_KEY)
    ) {
      throw new Error(
        "R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are required for R2 storage"
      );
    }
    if (parsed.data.NODE_ENV === "production")
      throw new Error("Development content cannot run in production");
    if (!parsed.data.CONTENT_STORAGE_DIRECTORY)
      throw new Error(
        "CONTENT_STORAGE_DIRECTORY is required for development content"
      );
    if (
      !["localhost", "127.0.0.1", "[::1]"].includes(
        new URL(parsed.data.WEB_ORIGIN).hostname
      )
    ) {
      throw new Error("Development content requires a loopback WEB_ORIGIN");
    }
  }
  return parsed.data;
}
