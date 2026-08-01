import { ApiError, apiClient } from "../lib/apiClient";

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

export function createSettingsApi(client = apiClient) {
  return {
    async getPreferences() {
      return parsePreferences(await client.get("/me/preferences"));
    },
    async updatePreferences(input) {
      return parsePreferences(await client.patch("/me/preferences", input));
    },
  };
}

export const settingsApi = createSettingsApi();
