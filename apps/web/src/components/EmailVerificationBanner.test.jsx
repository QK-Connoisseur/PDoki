import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import { ApiError } from "../lib/apiClient";
import EmailVerificationBanner from "./EmailVerificationBanner";

const unverifiedUser = {
  id: "21683ebe-d9fe-45a6-a914-2f03d91b76af",
  email: "member@pumdoki.example",
  displayName: "Sample Member",
  role: "MEMBER",
  createdAt: "2026-07-29T00:00:00.000Z",
  emailVerified: false,
};

function renderBanner(requestVerification, user = unverifiedUser) {
  return render(
    <AuthContext.Provider value={{ user, requestVerification }}>
      <EmailVerificationBanner />
    </AuthContext.Provider>
  );
}

afterEach(() => {
  window.sessionStorage.clear();
});

describe("EmailVerificationBanner", () => {
  it("is visible only for unverified users and reports accepted requests", async () => {
    renderBanner(vi.fn().mockResolvedValue({ status: "accepted" }));
    expect(screen.getByText(unverifiedUser.email)).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: "Resend verification link" })
    );
    expect(
      await screen.findByText(/Request accepted\. If delivery succeeds/i)
    ).toBeVisible();
  });

  it("reports throttling without claiming delivery", async () => {
    renderBanner(
      vi
        .fn()
        .mockRejectedValue(
          new ApiError("limited", { status: 429, code: "RATE_LIMITED" })
        )
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Resend verification link" })
    );
    expect(
      await screen.findByText(
        "Too many requests. Please wait before trying again."
      )
    ).toBeVisible();
    expect(screen.queryByText(/Request accepted/i)).not.toBeInTheDocument();
  });

  it("dismisses immediately and remembers the choice for this browser session", async () => {
    const first = renderBanner(vi.fn());

    await userEvent.click(
      screen.getByRole("button", {
        name: "Dismiss email verification reminder",
      })
    );
    expect(
      screen.queryByLabelText("Email verification")
    ).not.toBeInTheDocument();

    first.unmount();
    renderBanner(vi.fn());
    expect(
      screen.queryByLabelText("Email verification")
    ).not.toBeInTheDocument();
  });

  it("shows the reminder again after the account email changes", async () => {
    const first = renderBanner(vi.fn());
    await userEvent.click(
      screen.getByRole("button", {
        name: "Dismiss email verification reminder",
      })
    );
    first.unmount();

    renderBanner(vi.fn(), {
      ...unverifiedUser,
      email: "new-address@pumdoki.example",
    });
    expect(screen.getByLabelText("Email verification")).toBeVisible();
  });

  it("does not carry pending or late resend feedback to a changed email", async () => {
    let resolveRequest;
    const requestVerification = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );
    const view = renderBanner(requestVerification);

    await userEvent.click(
      screen.getByRole("button", { name: "Resend verification link" })
    );
    expect(screen.getByRole("button", { name: "Requesting…" })).toBeDisabled();

    const changedUser = {
      ...unverifiedUser,
      email: "new-address@pumdoki.example",
    };
    view.rerender(
      <AuthContext.Provider value={{ user: changedUser, requestVerification }}>
        <EmailVerificationBanner />
      </AuthContext.Provider>
    );
    expect(screen.getByText(changedUser.email)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Resend verification link" })
    ).toBeEnabled();

    await act(async () => {
      resolveRequest({ status: "accepted" });
    });
    expect(screen.queryByText(/Request accepted/i)).not.toBeInTheDocument();
  });

  it("does not render once the user is verified", () => {
    renderBanner(vi.fn(), { ...unverifiedUser, emailVerified: true });
    expect(
      screen.queryByLabelText("Email verification")
    ).not.toBeInTheDocument();
  });
});
