import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Sidebar, { MobileNav } from "./Sidebar";

function renderSidebar(overrides = {}) {
  const props = {
    activePage: "home",
    onNavigate: vi.fn(),
    onOpenDashboard: vi.fn(),
    onOpenCreatorApplication: vi.fn(),
    onOpenSettings: vi.fn(),
    onLogout: vi.fn(),
    onNavigateLegal: vi.fn(),
    showComposeMenu: false,
    setShowComposeMenu: vi.fn(),
    onComposePost: vi.fn(),
    onComposeMoment: vi.fn(),
    ...overrides,
  };

  return { props, ...render(<Sidebar {...props} />) };
}

describe("Sidebar visual hooks", () => {
  it("identifies the connected rail and only marks the active route current", async () => {
    const user = userEvent.setup();
    const { container, props } = renderSidebar();

    expect(container.querySelector("aside")).toHaveClass(
      "member-glass-rail",
      "member-glass-rail-left"
    );

    const home = screen.getByRole("button", { name: "Home" });
    const connect = screen.getByRole("button", { name: "Connect" });
    const create = screen.getByRole("button", { name: "Create" });
    const more = screen.getByRole("button", { name: "More" });

    expect(home).toHaveAttribute("aria-current", "page");
    expect(home).toHaveClass("member-nav-item-active");
    expect(connect).not.toHaveAttribute("aria-current");
    expect(connect).toHaveClass("member-nav-item-inactive");
    expect(create).toHaveClass("member-nav-item-trigger");
    expect(more).toHaveClass("member-nav-item-trigger");

    await user.click(connect);
    expect(props.onNavigate).toHaveBeenCalledWith("connect");
  });

  it("exposes the same active-route semantics in the mobile navigation", () => {
    render(
      <MobileNav
        activePage="store"
        onNavigate={vi.fn()}
        showComposeMenu={false}
        setShowComposeMenu={vi.fn()}
      />
    );

    expect(screen.getByRole("navigation")).toHaveClass(
      "member-glass-mobile-nav"
    );
    expect(screen.getByRole("button", { name: "Store" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    );
  });
});
