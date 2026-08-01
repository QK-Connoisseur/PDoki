import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Boots the web dev server and runs specs from tests/e2e.
 * Browsers must be installed once with `npx playwright install` (CI does this).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run start:e2e:api",
      url: "http://127.0.0.1:3000/api/v1/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        NODE_ENV: "development",
        PORT: "3000",
        WEB_ORIGIN: "http://127.0.0.1:5173",
        DATABASE_URL:
          process.env.DATABASE_URL ??
          "postgresql://pumdoki:pumdoki@localhost:5432/pumdoki_dev",
        LOG_LEVEL: "warn",
        RATE_LIMIT_WINDOW_MS: "60000",
        RATE_LIMIT_MAX: "300",
        MAIL_TRANSPORT: "smtp",
        SMTP_HOST: "localhost",
        SMTP_PORT: "1025",
        MAIL_FROM: "no-reply@pumdoki.example",
      },
    },
    {
      command: "npm run dev:e2e:web",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        VITE_API_BASE_URL: "http://127.0.0.1:3000/api/v1",
      },
    },
  ],
});
