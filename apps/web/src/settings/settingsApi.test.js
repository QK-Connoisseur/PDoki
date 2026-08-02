import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/apiClient";
import {
  createSettingsApi,
  parseAccountSessions,
  parsePreferences,
} from "./settingsApi";

const user = {
  id: "21683ebe-d9fe-45a6-a914-2f03d91b76af",
  email: "member@pumdoki.example",
  displayName: "Sample Member",
  role: "MEMBER",
  createdAt: "2026-07-29T00:00:00.000Z",
  emailVerified: true,
};

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

  it("validates active session responses", () => {
    const sessions = [
      {
        id: "5ac3d89f-b6d3-4e72-a928-8cb19c607607",
        createdAt: "2026-08-01T12:00:00.000Z",
        expiresAt: "2026-08-31T12:00:00.000Z",
        ipAddress: null,
        userAgent: "Chrome/140",
        current: true,
      },
    ];
    expect(parseAccountSessions({ sessions })).toEqual(sessions);
    expect(() =>
      parseAccountSessions({ sessions: [{ current: "yes" }] })
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

  it("maps account and security operations to their endpoints", async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ sessions: [] }),
      patch: vi
        .fn()
        .mockResolvedValueOnce({ user })
        .mockResolvedValueOnce({ user: { ...user, emailVerified: false } })
        .mockResolvedValueOnce({ status: "changed" }),
      del: vi.fn().mockResolvedValue(null),
    };
    const api = createSettingsApi(client);

    await api.updateProfile({ displayName: "New Name" });
    await api.changeEmail({ email: "new@example.com", currentPassword: "pw" });
    await api.changePassword({
      currentPassword: "pw",
      newPassword: "new-password",
    });
    await api.getSessions();
    await api.revokeSession("session-id");

    expect(client.patch).toHaveBeenNthCalledWith(1, "/me/profile", {
      displayName: "New Name",
    });
    expect(client.patch).toHaveBeenNthCalledWith(2, "/me/email", {
      email: "new@example.com",
      currentPassword: "pw",
    });
    expect(client.patch).toHaveBeenNthCalledWith(3, "/me/password", {
      currentPassword: "pw",
      newPassword: "new-password",
    });
    expect(client.get).toHaveBeenCalledWith("/me/sessions");
    expect(client.del).toHaveBeenCalledWith("/me/sessions/session-id");
  });
});
