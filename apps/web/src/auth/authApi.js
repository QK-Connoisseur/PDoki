import { ApiError, apiClient } from "../lib/apiClient";

export const AUTH_ROLES = Object.freeze({
  MEMBER: "MEMBER",
  CREATOR: "CREATOR",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
});

const canonicalRoles = new Set(Object.values(AUTH_ROLES));

function invalidResponse() {
  return new ApiError("Authentication service returned an invalid response", {
    status: 500,
    code: "INVALID_RESPONSE",
  });
}

export function parseAuthUser(payload) {
  const user = payload?.user;
  const createdAt = Date.parse(user?.createdAt);
  if (
    !user ||
    typeof user.id !== "string" ||
    typeof user.email !== "string" ||
    typeof user.displayName !== "string" ||
    !canonicalRoles.has(user.role) ||
    !Number.isFinite(createdAt) ||
    typeof user.emailVerified !== "boolean"
  ) {
    throw invalidResponse();
  }
  return user;
}

function expectStatus(payload, expected) {
  if (payload?.status !== expected) throw invalidResponse();
  return payload;
}

export function createAuthApi(client = apiClient) {
  return {
    async getMe() {
      return parseAuthUser(await client.get("/me"));
    },
    async login(input) {
      return parseAuthUser(await client.post("/auth/login", input));
    },
    async register(input) {
      return parseAuthUser(await client.post("/auth/register", input));
    },
    logout() {
      return client.post("/auth/logout");
    },
    logoutAll() {
      return client.post("/auth/logout-all");
    },
    requestVerification() {
      return client
        .post("/auth/verify-email/request")
        .then((payload) => expectStatus(payload, "accepted"));
    },
    async confirmVerification(token) {
      return parseAuthUser(
        await client.post("/auth/verify-email/confirm", { token })
      );
    },
    requestPasswordReset(email) {
      return client
        .post("/auth/password-reset/request", { email })
        .then((payload) => expectStatus(payload, "accepted"));
    },
    confirmPasswordReset(token, password) {
      return client
        .post("/auth/password-reset/confirm", { token, password })
        .then((payload) => expectStatus(payload, "reset"));
    },
  };
}

export const authApi = createAuthApi();
