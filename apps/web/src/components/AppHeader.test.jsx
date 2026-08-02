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
