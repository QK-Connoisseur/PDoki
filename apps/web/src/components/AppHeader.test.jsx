import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AppHeader from "./AppHeader";

function Location() {
  return <output>{useLocation().pathname}</output>;
}

function renderHeader(props) {
  return render(
    <MemoryRouter initialEntries={["/home"]}>
      <AppHeader notifications={[]} {...props} />
      <Location />
    </MemoryRouter>
  );
}

describe("AppHeader role navigation", () => {
  it("exposes the semantic member-header hook", () => {
    renderHeader();

    expect(screen.getByRole("banner")).toHaveClass("member-header");
  });

  it("reports each popover's disclosure state", async () => {
    const user = userEvent.setup();
    renderHeader();

    const disclosures = [
      ["Search", "member-search-popover"],
      ["Notifications", "member-notifications-popover"],
      ["Profile menu", "member-profile-popover"],
    ];

    for (const [name, popoverId] of disclosures) {
      const trigger = screen.getByRole("button", { name });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls", popoverId);
      expect(trigger).not.toHaveAttribute("aria-haspopup");

      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(document.getElementById(popoverId)).toBeInTheDocument();

      if (name === "Search") {
        expect(
          screen.getByRole("textbox", {
            name: "Search creators, posts, and tags",
          })
        ).toBeInTheDocument();
      }

      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(document.getElementById(popoverId)).not.toBeInTheDocument();
    }
  });

  it("offers creator applications to members without showing Dashboard", async () => {
    const user = userEvent.setup();
    renderHeader({ showCreatorApplication: true });

    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(
      screen.getByRole("button", { name: "Apply to become a creator" })
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Creator Dashboard" })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Apply to become a creator" })
    );
    expect(screen.getByText("/creator/onboarding")).toBeVisible();
  });

  it("offers Dashboard to creators without showing a new application", async () => {
    const user = userEvent.setup();
    renderHeader({ showCreatorDashboard: true });

    await user.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(
      screen.getByRole("button", { name: "Creator Dashboard" })
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Apply to become a creator" })
    ).not.toBeInTheDocument();
  });
});
