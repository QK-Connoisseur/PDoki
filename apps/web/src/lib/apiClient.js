import { env } from "./env";

/**
 * Typed error thrown for any non-2xx API response (or transport failure).
 * Mirrors the planned `/api/v1` error envelope so callers can branch on
 * `status`/`code` instead of parsing strings.
 */
export class ApiError extends Error {
  constructor(message, { status, code, requestId, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? 0;
    this.code = code ?? "unknown_error";
    this.requestId = requestId;
    this.details = details;
  }

  /** True for transport/network failures (no HTTP response received). */
  get isNetworkError() {
    return this.status === 0;
  }
}

function generateRequestId() {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * Create an API client bound to a base URL.
 *
 * Responsibilities (Phase 1 foundation — no real backend yet):
 *  - Prefix every request with the configured base URL.
 *  - Send credentials (cookies) so future session auth works cross-origin.
 *  - Attach an `X-Request-Id` for traceability and echo it onto errors.
 *  - Normalize failures into `ApiError`.
 *  - Invoke `onUnauthorized` on 401 so the app can redirect to /login.
 *
 * `fetchImpl` is injectable for testing.
 */
export function createApiClient({
  baseUrl = env.apiBaseUrl,
  fetchImpl,
  onUnauthorized,
} = {}) {
  const doFetch = fetchImpl ?? globalThis.fetch?.bind(globalThis);

  async function request(path, { method = "GET", body, headers = {} } = {}) {
    const requestId = generateRequestId();
    const url = `${baseUrl}${path}`;

    let response;
    try {
      response = await doFetch(url, {
        method,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Request-Id": requestId,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new ApiError("Network request failed", {
        status: 0,
        code: "network_error",
        requestId,
      });
    }

    const isJson = response.headers
      ?.get?.("content-type")
      ?.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      if (response.status === 401 && onUnauthorized) onUnauthorized();
      throw new ApiError(
        payload?.message || `Request failed (${response.status})`,
        {
          status: response.status,
          code: payload?.code,
          requestId: payload?.requestId || requestId,
          details: payload?.details,
        }
      );
    }

    return payload;
  }

  return {
    request,
    get: (path, opts) => request(path, { ...opts, method: "GET" }),
    post: (path, body, opts) =>
      request(path, { ...opts, method: "POST", body }),
    put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
    patch: (path, body, opts) =>
      request(path, { ...opts, method: "PATCH", body }),
    del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
  };
}

/** Default client bound to the configured API base URL. */
export const apiClient = createApiClient();
