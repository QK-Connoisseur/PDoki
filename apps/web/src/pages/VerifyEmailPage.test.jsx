import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import { ApiError } from "../lib/apiClient";
import VerifyEmailPage from "./VerifyEmailPage";

const user = {
  id: "21683ebe-d9fe-45a6-a914-2f03d91b76af",
  email: "member@pumdoki.example",
  displayName: "Sample Member",
  role: "MEMBER",
  createdAt: "2026-07-29T00:00:00.000Z",
  emailVerified: false,
};

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.search || "no-search"}</span>;
}

function renderVerification(auth) {
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/verify-email?token=single-use-token"]}>
        <Routes>
          <Route
            path="/verify-email"
            element={
              <>
                <VerifyEmailPage />
                <LocationProbe />
              </>
            }
          />
          <Route path="/home" element={<div>Home</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

function authState(overrides = {}) {
  return {
    status: "unauthenticated",
    user: null,
    confirmVerification: vi
      .fn()
      .mockResolvedValue({ ...user, emailVerified: true }),
    requestVerification: vi.fn().mockResolvedValue({ status: "accepted" }),
    ...overrides,
  };
}

describe("VerifyEmailPage", () => {
  it("posts the token once, removes it from history, and shows success", async () => {
    const auth = authState();
    renderVerification(auth);

    expect(await screen.findByText("Email verified")).toBeVisible();
    expect(auth.confirmVerification).toHaveBeenCalledOnce();
    expect(auth.confirmVerification).toHaveBeenCalledWith("single-use-token");
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("no-search")
    );
  });

  it("offers authenticated users a resend after expiry", async () => {
    const auth = authState({
      status: "authenticated",
      user,
      confirmVerification: vi.fn().mockRejectedValue(
        new ApiError("expired", {
          status: 400,
          code: "TOKEN_EXPIRED",
        })
      ),
    });
    renderVerification(auth);

    expect(await screen.findByText("Verification link expired")).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Request a new link" })
    );
    await waitFor(() =>
      expect(auth.requestVerification).toHaveBeenCalledOnce()
    );
    expect(
      screen.getByText(/Request accepted\. If delivery succeeds/i)
    ).toBeVisible();
  });

  it("shows a safe state for an invalid or already-used token", async () => {
    renderVerification(
      authState({
        confirmVerification: vi.fn().mockRejectedValue(
          new ApiError("invalid", {
            status: 400,
            code: "INVALID_TOKEN",
          })
        ),
      })
    );

    expect(await screen.findByText("Verification link invalid")).toBeVisible();
    expect(
      screen.getByText(/missing, invalid, or has already been used/i)
    ).toBeVisible();
  });
});
