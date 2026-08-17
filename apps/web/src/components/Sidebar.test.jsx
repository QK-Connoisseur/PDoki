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
    expect(
      screen.queryByRole("button", { name: "Create", exact: true })
    ).not.toBeInTheDocument();
  });

  it("shows only compose actions that the current page implements", async () => {
    const user = userEvent.setup();
    const onComposePost = vi.fn();
    const setShowComposeMenu = vi.fn();
    renderSidebar({
      showComposeMenu: true,
      setShowComposeMenu,
      onComposePost,
      onComposeMoment: undefined,
    });

    expect(
      screen.getByRole("button", { name: "Create Post", exact: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create Moment", exact: true })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Create Post", exact: true })
    );
    expect(onComposePost).toHaveBeenCalledOnce();
    expect(setShowComposeMenu).toHaveBeenCalledWith(false);
  });

  it("keeps the narrow-screen compose menu inside the right edge", () => {
    render(
      <MobileNav
        activePage="store"
        onNavigate={vi.fn()}
        showComposeMenu
        setShowComposeMenu={vi.fn()}
        onComposePost={vi.fn()}
      />
    );

    const menu = screen.getByRole("button", {
      name: "Create Post",
      exact: true,
    }).parentElement;
    expect(menu).toHaveClass("right-0", "max-w-[calc(100vw-1rem)]");
    expect(menu).not.toHaveClass("left-1/2", "-translate-x-1/2");
  });
});
