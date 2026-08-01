import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/apiClient";
import { AUTH_ROLES, createAuthApi, parseAuthUser } from "./authApi";

const user = {
  id: "21683ebe-d9fe-45a6-a914-2f03d91b76af",
  email: "member@pumdoki.example",
  displayName: "Sample Member",
  role: AUTH_ROLES.MEMBER,
  createdAt: "2026-07-29T00:00:00.000Z",
  emailVerified: false,
};

describe("authApi", () => {
  it("validates and returns the public auth user", () => {
    expect(parseAuthUser({ user })).toEqual(user);
  });

  it("rejects malformed or non-canonical user responses", () => {
    expect(() =>
      parseAuthUser({ user: { ...user, role: "member" } })
    ).toThrowError(ApiError);
  });

  it("maps every auth operation to its API endpoint", async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ user }),
      post: vi
        .fn()
        .mockResolvedValueOnce({ user })
        .mockResolvedValueOnce({ user })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ status: "accepted" })
        .mockResolvedValueOnce({ user: { ...user, emailVerified: true } })
        .mockResolvedValueOnce({ status: "accepted" })
        .mockResolvedValueOnce({ status: "reset" }),
    };
    const api = createAuthApi(client);

    await api.getMe();
    await api.login({ email: user.email, password: "long-password" });
    await api.register({
      email: user.email,
      password: "long-password",
      displayName: user.displayName,
      ageAttested: true,
      acceptedTermsVersion: "terms",
      acceptedPrivacyVersion: "privacy",
    });
    await api.logout();
    await api.logoutAll();
    await api.requestVerification();
    await api.confirmVerification("verify-token");
    await api.requestPasswordReset(user.email);
    await api.confirmPasswordReset("reset-token", "new-long-password");

    expect(client.get).toHaveBeenCalledWith("/me");
    expect(client.post.mock.calls.map(([path]) => path)).toEqual([
      "/auth/login",
      "/auth/register",
      "/auth/logout",
      "/auth/logout-all",
      "/auth/verify-email/request",
      "/auth/verify-email/confirm",
      "/auth/password-reset/request",
      "/auth/password-reset/confirm",
    ]);
  });
});
