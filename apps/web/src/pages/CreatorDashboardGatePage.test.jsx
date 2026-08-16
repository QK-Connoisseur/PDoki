import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AUTH_ROLES } from "../auth/authApi";
import CreatorDashboardGatePage from "./CreatorDashboardGatePage";

const member = {
  role: AUTH_ROLES.MEMBER,
  emailVerified: true,
};

function renderGate(user = member) {
  const onOpenApplication = vi.fn();
  const onReturnHome = vi.fn();
  render(
    <CreatorDashboardGatePage
      user={user}
      onOpenApplication={onOpenApplication}
      onReturnHome={onReturnHome}
    />
  );
  return { onOpenApplication, onReturnHome };
}

describe("CreatorDashboardGatePage", () => {
  it("explains the creator boundary and routes members to their application", async () => {
    const user = userEvent.setup();
    const { onOpenApplication, onReturnHome } = renderGate();

    expect(
      screen.getByRole("heading", {
        name: "Oops! You need verified creator access to open this studio.",
      })
    ).toBeVisible();
    expect(screen.getByText("Your member email is verified.")).toBeVisible();

    await user.click(
      screen.getByRole("button", {
        name: "Start or view creator application",
      })
    );
    await user.click(screen.getByRole("button", { name: "Return home" }));

    expect(onOpenApplication).toHaveBeenCalledOnce();
    expect(onReturnHome).toHaveBeenCalledOnce();
  });

  it("explains the email requirement to unverified members", () => {
    renderGate({ ...member, emailVerified: false });

    expect(
      screen.getByText("Required before you can submit an application.")
    ).toBeVisible();
  });

  it("does not offer the member application action to other roles", () => {
    renderGate({ role: AUTH_ROLES.ADMIN, emailVerified: true });

    expect(
      screen.queryByRole("button", {
        name: "Start or view creator application",
      })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Return home" })).toBeVisible();
  });
});
