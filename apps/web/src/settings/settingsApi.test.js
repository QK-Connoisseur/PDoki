import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/apiClient";
import { createSettingsApi, parsePreferences } from "./settingsApi";

describe("settingsApi", () => {
  it("validates and returns preferences", () => {
    expect(
      parsePreferences({ preferences: { showExplicitContent: false } })
    ).toEqual({ showExplicitContent: false });
  });

  it("rejects malformed preference responses", () => {
    expect(() =>
      parsePreferences({ preferences: { showExplicitContent: "yes" } })
    ).toThrowError(ApiError);
  });

  it("maps preference reads and writes to their endpoints", async () => {
    const client = {
      get: vi
        .fn()
        .mockResolvedValue({ preferences: { showExplicitContent: false } }),
      patch: vi
        .fn()
        .mockResolvedValue({ preferences: { showExplicitContent: true } }),
    };
    const api = createSettingsApi(client);

    await api.getPreferences();
    await api.updatePreferences({ showExplicitContent: true });

    expect(client.get).toHaveBeenCalledWith("/me/preferences");
    expect(client.patch).toHaveBeenCalledWith("/me/preferences", {
      showExplicitContent: true,
    });
  });
});
