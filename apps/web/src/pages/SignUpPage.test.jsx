import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "../auth/policyVersions";
import { ApiError } from "../lib/apiClient";
import SignUpPage from "./SignUpPage";

function renderSignup(onRegister = vi.fn().mockResolvedValue(null)) {
  render(
    <SignUpPage
      onRegister={onRegister}
      onBack={vi.fn()}
      onNavigateLegal={vi.fn()}
    />
  );
  return onRegister;
}

async function fillValidForm({ attest = true } = {}) {
  await userEvent.type(screen.getByLabelText("Display name"), "New Member");
  await userEvent.type(
    screen.getByLabelText("Email address"),
    "NEW@PUMDOKI.EXAMPLE"
  );
  await userEvent.type(screen.getByLabelText("Password"), "long-password");
  await userEvent.type(
    screen.getByLabelText("Confirm password"),
    "long-password"
  );
  if (attest) await userEvent.click(screen.getByRole("checkbox"));
}

describe("SignUpPage", () => {
  it("keeps the combined age and policy attestation unchecked", async () => {
    const onRegister = renderSignup();
    await fillValidForm({ attest: false });

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: "Create Account" })
    ).toBeDisabled();
    expect(onRegister).not.toHaveBeenCalled();
  });

  it("submits the complete registration contract", async () => {
    const onRegister = renderSignup();
    await fillValidForm();
    await userEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    await waitFor(() =>
      expect(onRegister).toHaveBeenCalledWith({
        displayName: "New Member",
        email: "new@pumdoki.example",
        password: "long-password",
        ageAttested: true,
        acceptedTermsVersion: CURRENT_TERMS_VERSION,
        acceptedPrivacyVersion: CURRENT_PRIVACY_VERSION,
      })
    );
  });

  it("explains a duplicate-email conflict", async () => {
    renderSignup(
      vi.fn().mockRejectedValue(
        new ApiError("An account already exists", {
          status: 409,
          code: "CONFLICT",
        })
      )
    );
    await fillValidForm();
    await userEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      await screen.findByText(
        "An account already exists for this email address."
      )
    ).toBeVisible();
  });

  it("enforces the shared 10-character minimum before submit", async () => {
    const onRegister = renderSignup();
    await userEvent.type(screen.getByLabelText("Display name"), "New Member");
    await userEvent.type(
      screen.getByLabelText("Email address"),
      "new@pumdoki.example"
    );
    await userEvent.type(screen.getByLabelText("Password"), "shortpass");
    await userEvent.type(
      screen.getByLabelText("Confirm password"),
      "shortpass"
    );
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(screen.getByText("At least 10 characters")).toBeVisible();
    expect(onRegister).not.toHaveBeenCalled();
  });
});
