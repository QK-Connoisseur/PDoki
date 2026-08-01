import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/apiClient";
import { AuthProvider } from "./AuthProvider";
import { useAuth } from "./authContext";

const user = {
  id: "21683ebe-d9fe-45a6-a914-2f03d91b76af",
  email: "member@pumdoki.example",
  displayName: "Sample Member",
  role: "MEMBER",
  createdAt: "2026-07-29T00:00:00.000Z",
  emailVerified: false,
};

function makeApi(overrides = {}) {
  return {
    getMe: vi.fn().mockResolvedValue(user),
    login: vi.fn().mockResolvedValue(user),
    register: vi.fn().mockResolvedValue(user),
    logout: vi.fn().mockResolvedValue(null),
    logoutAll: vi.fn().mockResolvedValue(null),
    requestVerification: vi.fn().mockResolvedValue({ status: "accepted" }),
    confirmVerification: vi
      .fn()
      .mockResolvedValue({ ...user, emailVerified: true }),
    requestPasswordReset: vi.fn().mockResolvedValue({ status: "accepted" }),
    confirmPasswordReset: vi.fn().mockResolvedValue({ status: "reset" }),
    ...overrides,
  };
}

function Harness() {
  const auth = useAuth();
  const [, setLastError] = useState(null);
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="email">{auth.user?.email || "none"}</span>
      <button onClick={() => void auth.refreshSession().catch(setLastError)}>
        Retry
      </button>
      <button
        onClick={() => void auth.requestVerification().catch(setLastError)}
      >
        Request verification
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  it("restores an authenticated session from /me", async () => {
    const api = makeApi();
    render(
      <AuthProvider api={api}>
        <Harness />
      </AuthProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated")
    );
    expect(screen.getByTestId("email")).toHaveTextContent(user.email);
  });

  it("treats /me 401 as an expected unauthenticated state", async () => {
    const api = makeApi({
      getMe: vi
        .fn()
        .mockRejectedValue(
          new ApiError("Authentication required", { status: 401 })
        ),
    });
    render(
      <AuthProvider api={api}>
        <Harness />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated")
    );
    expect(screen.getByTestId("email")).toHaveTextContent("none");
  });

  it("shows unavailable on transport failure and can retry", async () => {
    const api = makeApi({
      getMe: vi
        .fn()
        .mockRejectedValueOnce(new ApiError("offline", { status: 0 }))
        .mockResolvedValueOnce(user),
    });
    render(
      <AuthProvider api={api}>
        <Harness />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("unavailable")
    );
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated")
    );
  });

  it("invalidates an established session after a later 401", async () => {
    const api = makeApi({
      requestVerification: vi
        .fn()
        .mockRejectedValue(
          new ApiError("Authentication required", { status: 401 })
        ),
    });
    render(
      <AuthProvider api={api}>
        <Harness />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated")
    );

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: "Request verification" })
      );
    });
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated")
    );
  });
});
