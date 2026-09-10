import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "../auth/policyVersions";
import CreatorDashboardPage from "./CreatorDashboardPage";
import LegalHubPage from "./LegalHubPage";
import BillingPage from "./BillingPage";

vi.mock("../lib/useSimulatedFetch", () => ({
  useSimulatedFetch: () => ({ status: "ready", retry: vi.fn() }),
}));

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

function renderAccountPage(page) {
  return render(
    <AuthContext.Provider value={{ user: { emailVerified: true } }}>
      {page}
    </AuthContext.Provider>
  );
}

describe("Prototype operational disclosures", () => {
  it("keeps the unapproved-policy and no-intake notice on every legal page", async () => {
    const user = userEvent.setup();
    render(<LegalHubPage />);
    const navigation = screen
      .getAllByRole("complementary")
      .find((element) => !element.hasAttribute("aria-label"));
    const links = within(navigation).getAllByRole("button");

    for (const link of links) {
      await user.click(link);
      expect(
        screen.getByRole("complementary", { name: "Prototype legal status" })
      ).toHaveTextContent("Prototype — not counsel-approved");
      expect(screen.getByRole("main")).toHaveTextContent(
        "This is not a live legal, safety, or support intake."
      );
      expect(screen.getByRole("main")).not.toHaveTextContent(
        /@pumdoki\.com|Pumdoki, Inc\.|We employ content moderation|Pumdoki participates in industry frameworks/
      );
    }
  });

  it("shows the new prototype acceptance versions on the linked notices", async () => {
    const user = userEvent.setup();
    render(<LegalHubPage initialPage="terms" />);

    expect(CURRENT_TERMS_VERSION).toBe("prototype-2026-09-06");
    expect(screen.getByRole("main")).toHaveTextContent(CURRENT_TERMS_VERSION);
    await user.click(screen.getByRole("button", { name: "Privacy Policy" }));
    expect(CURRENT_PRIVACY_VERSION).toBe("prototype-2026-09-06");
    expect(screen.getByRole("main")).toHaveTextContent(CURRENT_PRIVACY_VERSION);
  });

  it("separates example contacts from independent safety resources", () => {
    render(<LegalHubPage initialPage="contact" />);

    expect(screen.getByRole("main")).toHaveTextContent(
      "reserved examples, not working mailboxes"
    );
    expect(screen.getByRole("main")).toHaveTextContent(
      "support@pumdoki.example"
    );
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(screen.getByRole("link", { name: "StopNCII.org" })).toHaveAttribute(
      "href",
      "https://stopncii.org/"
    );
    expect(
      screen.getByRole("link", { name: "NCMEC CyberTipline" })
    ).toHaveAttribute(
      "href",
      "https://www.missingkids.org/gethelpnow/cybertipline"
    );
    expect(screen.getByRole("main")).toHaveTextContent(
      "Links do not imply a partnership."
    );
  });

  it("does not present creator identity, banking, or protection controls as active", async () => {
    const user = userEvent.setup();
    renderAccountPage(<CreatorDashboardPage />);
    await user.click(
      screen.getByRole("button", { name: "Settings", exact: true })
    );

    expect(screen.getAllByText("Not collected")).toHaveLength(5);
    expect(
      screen.queryByText(/Approved ·|✓ Complete|Chase/)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Support unavailable" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Payout setup unavailable" })
    ).toBeDisabled();
    const protection = screen.getByRole("button", {
      name: "Watermark all images",
    });
    await user.click(protection);
    expect(protection).toBeDisabled();
    expect(protection).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("complementary", {
        name: "Creator dashboard prototype status",
      })
    ).toBeVisible();
  });

  it("keeps unavailable billing security controls off and marks money as simulated", async () => {
    const user = userEvent.setup();
    renderAccountPage(<BillingPage />);
    await user.click(
      screen.getByRole("button", { name: "Billing Settings", exact: true })
    );

    expect(
      screen.getByRole("complementary", { name: "Billing prototype status" })
    ).toHaveTextContent("No money moves here");
    for (const name of [
      "Require PIN for purchases",
      "Two-factor for large transactions (>$500)",
    ]) {
      const protection = screen.getByRole("button", { name, exact: true });
      await user.click(protection);
      expect(protection).toBeDisabled();
      expect(protection).toHaveAttribute("aria-pressed", "false");
    }
    expect(
      screen.queryByRole("button", { name: "Add Funds", exact: true })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Withdraw", exact: true })
    ).not.toBeInTheDocument();
  });
});
