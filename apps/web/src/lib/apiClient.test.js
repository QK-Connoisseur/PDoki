import { describe, it, expect, vi } from "vitest";
import { createApiClient, ApiError } from "./apiClient";

function jsonResponse(body, { status = 200 } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  };
}

describe("createApiClient", () => {
  it("prefixes the base URL and sends credentials + a request id", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = createApiClient({
      baseUrl: "http://api.test/api/v1",
      fetchImpl,
    });

    const data = await client.get("/health");

    expect(data).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("http://api.test/api/v1/health");
    expect(init.credentials).toBe("include");
    expect(init.headers["X-Request-Id"]).toBeTruthy();
  });

  it("serializes a JSON body and sets Content-Type on writes", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
    const client = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    await client.post("/users", { email: "a@pumdoki.example" });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ email: "a@pumdoki.example" });
  });

  it("throws a typed ApiError carrying status and code on non-2xx", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(
          { message: "Bad input", code: "validation_error" },
          { status: 422 }
        )
      );
    const client = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    await expect(client.post("/x", {})).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      code: "validation_error",
    });
  });

  it("invokes onUnauthorized on 401", async () => {
    const onUnauthorized = vi.fn();
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: "nope" }, { status: 401 }));
    const client = createApiClient({
      baseUrl: "http://api.test",
      fetchImpl,
      onUnauthorized,
    });

    await expect(client.get("/me")).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("wraps transport failures as a network ApiError", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("offline"));
    const client = createApiClient({ baseUrl: "http://api.test", fetchImpl });

    const error = await client.get("/health").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.isNetworkError).toBe(true);
  });
});
