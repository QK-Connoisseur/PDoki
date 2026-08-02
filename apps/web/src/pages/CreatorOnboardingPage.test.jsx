import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import {
  CREATOR_AGREEMENT_VERSION,
  CREATOR_CONTENT_POLICY_VERSION,
  IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
} from "../creator/creatorApplicationApi";
import CreatorOnboardingPage from "./CreatorOnboardingPage";

const member = {
  id: "7024fc48-182a-4544-b341-046837db9d2f",
  email: "member@pumdoki.example",
  displayName: "Sample Member",
  role: "MEMBER",
  createdAt: "2026-08-02T01:00:00.000Z",
  emailVerified: true,
};

const application = {
  id: "e03581af-ded8-42e3-8298-f4d93844fd1e",
  userId: member.id,
  creatorName: "Sakura Studio",
  countryCode: "US",
  status: "PENDING",
  identityVerificationStatus: "NOT_STARTED",
  submittedAt: "2026-08-02T01:00:00.000Z",
  updatedAt: "2026-08-02T01:00:00.000Z",
};

function renderPage({ user = member, api, requestVerification = vi.fn() }) {
  return render(
    <AuthContext.Provider value={{ user, requestVerification }}>
      <CreatorOnboardingPage
        api={api}
        onBack={vi.fn()}
        onNavigateLegal={vi.fn()}
      />
    </AuthContext.Provider>
  );
}

beforeEach(() => vi.clearAllMocks());

describe("CreatorOnboardingPage", () => {
  it("loads and displays a persisted pending outcome without dashboard access", async () => {
    const api = {
      getCurrent: vi.fn().mockResolvedValue(application),
      submit: vi.fn(),
    };
    renderPage({ api });

    expect(await screen.findByText("Application received")).toBeVisible();
    expect(screen.getByText("Sakura Studio")).toBeVisible();
    expect(screen.getByText("NOT STARTED")).toBeVisible();
    expect(screen.queryByText(/creator dashboard/i)).not.toBeInTheDocument();
    expect(api.submit).not.toHaveBeenCalled();
  });

  it("requires email verification before showing the application form", async () => {
    const user = userEvent.setup();
    const requestVerification = vi
      .fn()
      .mockResolvedValue({ status: "accepted" });
    renderPage({
      user: { ...member, emailVerified: false },
      api: { getCurrent: vi.fn().mockResolvedValue(null), submit: vi.fn() },
      requestVerification,
    });

    await user.click(
      await screen.findByRole("button", { name: "Send verification email" })
    );
    expect(requestVerification).toHaveBeenCalledOnce();
    expect(
      await screen.findByText(
        "Request accepted. Check Mailpit when testing locally."
      )
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Submit application" })
    ).not.toBeInTheDocument();
  });

  it("submits explicit versioned acceptances and shows the pending result", async () => {
    const user = userEvent.setup();
    const api = {
      getCurrent: vi.fn().mockResolvedValue(null),
      submit: vi.fn().mockResolvedValue(application),
    };
    renderPage({ api });

    await user.type(await screen.findByLabelText("Country code"), "us");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    const policyChecks = screen.getAllByRole("checkbox");
    expect(policyChecks).toHaveLength(2);
    await user.click(policyChecks[0]);
    await user.click(policyChecks[1]);
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Submit application" })
    );

    await waitFor(() => expect(api.submit).toHaveBeenCalledOnce());
    expect(api.submit).toHaveBeenCalledWith({
      creatorName: "Sample Member",
      countryCode: "us",
      acceptedCreatorAgreement: true,
      acceptedCreatorAgreementVersion: CREATOR_AGREEMENT_VERSION,
      acceptedContentPolicy: true,
      acceptedContentPolicyVersion: CREATOR_CONTENT_POLICY_VERSION,
      acceptedIdentityVerificationDisclosure: true,
      acceptedIdentityVerificationDisclosureVersion:
        IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
    });
    expect(await screen.findByText("Application received")).toBeVisible();
  });

  it("offers a retry when the current application cannot be loaded", async () => {
    const user = userEvent.setup();
    const api = {
      getCurrent: vi
        .fn()
        .mockRejectedValueOnce(new Error("offline"))
        .mockResolvedValueOnce(null),
      submit: vi.fn(),
    };
    renderPage({ api });

    expect(
      await screen.findByText("Creator application unavailable")
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByText("Tell us about your creator profile")
    ).toBeVisible();
    expect(api.getCurrent).toHaveBeenCalledTimes(2);
  });
});
