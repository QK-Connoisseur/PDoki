import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import { ApiError } from "../lib/apiClient";
import ResetPasswordPage from "./ResetPasswordPage";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.search || "no-search"}</span>;
}

function renderReset(
  confirmPasswordReset,
  entry = "/reset-password?token=reset"
) {
  render(
    <AuthContext.Provider
      value={{
        confirmPasswordReset,
        status: "unauthenticated",
        user: null,
      }}
    >
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route
            path="/reset-password"
            element={
              <>
                <ResetPasswordPage />
                <LocationProbe />
              </>
            }
          />
          <Route path="/forgot-password" element={<div>Request page</div>} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

async function submitPassword(password, confirm = password) {
  await userEvent.type(screen.getByLabelText("New password"), password);
  await userEvent.type(screen.getByLabelText("Confirm new password"), confirm);
  await userEvent.click(screen.getByRole("button", { name: "Reset password" }));
}

describe("ResetPasswordPage", () => {
  it("removes the token from the visible URL while retaining it for submission", async () => {
    const confirmPasswordReset = vi.fn().mockResolvedValue(null);
    renderReset(confirmPasswordReset);

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("no-search")
    );
    await submitPassword("new-long-password");
    expect(confirmPasswordReset).toHaveBeenCalledWith(
      "reset",
      "new-long-password"
    );
  });

  it("enforces shared password rules before submission", async () => {
    const confirmPasswordReset = vi.fn();
    renderReset(confirmPasswordReset);
    await submitPassword("too-short");

    expect(
      screen.getByText("Use a password between 10 and 128 characters.")
    ).toBeVisible();
    expect(confirmPasswordReset).not.toHaveBeenCalled();
  });

  it("resets the password and explains global session revocation", async () => {
    const confirmPasswordReset = vi.fn().mockResolvedValue(null);
    renderReset(confirmPasswordReset);
    await submitPassword("new-long-password");

    await waitFor(() =>
      expect(confirmPasswordReset).toHaveBeenCalledWith(
        "reset",
        "new-long-password"
      )
    );
    expect(screen.getByText("Password reset complete")).toBeVisible();
    expect(
      screen.getByText(/every existing session has been revoked/i)
    ).toBeVisible();
  });

  it.each([
    ["TOKEN_EXPIRED", "Reset link expired"],
    ["INVALID_TOKEN", "Reset link invalid"],
  ])("shows distinct recovery for %s", async (code, heading) => {
    renderReset(
      vi
        .fn()
        .mockRejectedValue(new ApiError("bad token", { status: 400, code }))
    );
    await submitPassword("new-long-password");

    expect(await screen.findByText(heading)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Request a new link" })
    ).toBeVisible();
  });
});
