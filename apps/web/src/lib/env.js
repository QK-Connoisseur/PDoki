/**
 * Centralized, validated access to web environment variables.
 *
 * Vite exposes only variables prefixed with `VITE_` to client code via
 * `import.meta.env`. Keep all reads here so missing/misconfigured values fail
 * loudly in one place instead of surfacing as confusing runtime errors deep in
 * the app.
 */

function readString(key, fallback) {
  const value = import.meta.env?.[key];
  if (value == null || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  /** Base URL of the Pumdoki API, e.g. http://localhost:3000/api/v1 */
  apiBaseUrl: readString("VITE_API_BASE_URL", "http://localhost:3000/api/v1"),
  /** Vite's standard mode flag. */
  isDev: import.meta.env?.DEV ?? false,
};
