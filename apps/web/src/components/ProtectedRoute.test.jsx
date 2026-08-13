import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AUTH_ROLES } from "../auth/authApi";
import { AuthContext } from "../auth/authContext";
import ProtectedRoute from "./ProtectedRoute";

const user = {
  id: "21683ebe-d9fe-45a6-a914-2f03d91b76af",
  email: "member@pumdoki.example",
  displayName: "Sample Member",
  role: AUTH_ROLES.MEMBER,
  createdAt: "2026-07-29T00:00:00.000Z",
  emailVerified: true,
};

function LoginDestination() {
  const location = useLocation();
  return (
    <div>
      Login destination
      <span data-testid="requested-path">
        {location.state?.from?.pathname || "none"}
      </span>
    </div>
  );
}

function renderRoute(auth, roles, forbiddenFallback) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/private?tab=one"]}>
        <Routes>
          <Route path="/login" element={<LoginDestination />} />
          <Route
            path="/private"
            element={
              <ProtectedRoute
                roles={roles}
                forbiddenFallback={forbiddenFallback}
              >
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

function authState(overrides = {}) {
  return {
    status: "authenticated",
    user,
    refreshSession: vi.fn().mockResolvedValue(user),
    requestVerification: vi.fn(),
    ...overrides,
  };
}

describe("ProtectedRoute", () => {
  it("renders a loading state while session restoration runs", () => {
    renderRoute(authState({ status: "loading", user: null }));
    expect(screen.getByText("Restoring your session…")).toBeVisible();
  });

  it("renders an unavailable state with retry", async () => {
    const auth = authState({ status: "unavailable", user: null });
    renderRoute(auth);

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(auth.refreshSession).toHaveBeenCalledOnce();
  });

  it("redirects anonymous users and preserves the requested location", () => {
    renderRoute(authState({ status: "unauthenticated", user: null }));

    expect(screen.getByText("Login destination")).toBeVisible();
    expect(screen.getByTestId("requested-path")).toHaveTextContent("/private");
  });

  it("renders a forbidden state for a non-canonical role mismatch", () => {
    renderRoute(authState(), [AUTH_ROLES.CREATOR]);
    expect(screen.getByText("Access denied")).toBeVisible();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders a route-specific forbidden fallback when one is supplied", () => {
    renderRoute(
      authState(),
      [AUTH_ROLES.CREATOR],
      <div>Creator studio gate</div>
    );

    expect(screen.getByText("Creator studio gate")).toBeVisible();
    expect(screen.queryByText("Access denied")).not.toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("allows a matching canonical role", () => {
    renderRoute(authState(), [AUTH_ROLES.MEMBER]);
    expect(screen.getByText("Protected content")).toBeVisible();
  });
});
