import { ApiError, apiClient } from "../lib/apiClient";
import { parseAuthUser } from "../auth/authApi";

function invalidResponse() {
  return new ApiError("Settings service returned an invalid response", {
    status: 500,
    code: "INVALID_RESPONSE",
  });
}

export function parsePreferences(payload) {
  const preferences = payload?.preferences;
  if (!preferences || typeof preferences.showExplicitContent !== "boolean") {
    throw invalidResponse();
  }
  return preferences;
}

export function parseAccountSessions(payload) {
  const sessions = payload?.sessions;
  if (
    !Array.isArray(sessions) ||
    sessions.some(
      (session) =>
        !session ||
        typeof session.id !== "string" ||
        !Number.isFinite(Date.parse(session.createdAt)) ||
        !Number.isFinite(Date.parse(session.expiresAt)) ||
        (session.ipAddress !== null && typeof session.ipAddress !== "string") ||
        (session.userAgent !== null && typeof session.userAgent !== "string") ||
        typeof session.current !== "boolean"
    )
  ) {
    throw invalidResponse();
  }
  return sessions;
}

export function createSettingsApi(client = apiClient) {
  return {
    async getPreferences() {
      return parsePreferences(await client.get("/me/preferences"));
    },
    async updatePreferences(input) {
      return parsePreferences(await client.patch("/me/preferences", input));
    },
    async updateProfile(input) {
      return parseAuthUser(await client.patch("/me/profile", input));
    },
    async changeEmail(input) {
      return parseAuthUser(await client.patch("/me/email", input));
    },
    async changePassword(input) {
      const payload = await client.patch("/me/password", input);
      if (payload?.status !== "changed") throw invalidResponse();
      return payload;
    },
    async getSessions() {
      return parseAccountSessions(await client.get("/me/sessions"));
    },
    revokeSession(sessionId) {
      return client.del(`/me/sessions/${encodeURIComponent(sessionId)}`);
    },
  };
}

export const settingsApi = createSettingsApi();
