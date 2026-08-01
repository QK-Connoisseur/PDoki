import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/apiClient";
import LoginPage from "./LoginPage";

function renderLogin(onLogin = vi.fn().mockResolvedValue(null)) {
  render(
    <LoginPage
      onLogin={onLogin}
      onOpenSignup={vi.fn()}
      onForgotPassword={vi.fn()}
      onNavigateLegal={vi.fn()}
    />
  );
  return onLogin;
}

async function submitCredentials() {
  await userEvent.type(
    screen.getByLabelText("Email"),
    "  MEMBER@PUMDOKI.EXAMPLE  "
  );
  await userEvent.type(screen.getByLabelText("Password"), "correct-password");
  await userEvent.click(screen.getByRole("button", { name: "Log in" }));
}

describe("LoginPage", () => {
  it("submits normalized credentials to the real login action", async () => {
    const onLogin = renderLogin();
    await submitCredentials();

    await waitFor(() =>
      expect(onLogin).toHaveBeenCalledWith({
        email: "member@pumdoki.example",
        password: "correct-password",
      })
    );
  });

  it("uses generic copy for an invalid credential response", async () => {
    renderLogin(
      vi.fn().mockRejectedValue(new ApiError("Invalid", { status: 401 }))
    );
    await submitCredentials();
    expect(
      await screen.findByText("The email or password is incorrect.")
    ).toBeVisible();
  });

  it("shows a retry-later message when login is rate limited", async () => {
    renderLogin(
      vi.fn().mockRejectedValue(
        new ApiError("Limited", {
          status: 429,
          code: "RATE_LIMITED",
        })
      )
    );
    await submitCredentials();
    expect(
      await screen.findByText(
        "Too many login attempts. Please wait and try again."
      )
    ).toBeVisible();
  });

  it("retains the email after a transport failure", async () => {
    renderLogin(
      vi
        .fn()
        .mockRejectedValue(
          new ApiError("offline", { status: 0, code: "NETWORK_ERROR" })
        )
    );
    await submitCredentials();
    expect(
      await screen.findByText(
        "We couldn’t reach the authentication service. Please try again."
      )
    ).toBeVisible();
    expect(screen.getByLabelText("Email")).toHaveValue(
      "MEMBER@PUMDOKI.EXAMPLE"
    );
  });

  it("marks Google sign-in as unavailable", () => {
    renderLogin();
    expect(
      screen.getByRole("button", { name: "Google sign-in unavailable" })
    ).toBeDisabled();
  });
});
