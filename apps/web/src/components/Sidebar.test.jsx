import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Sidebar, { MobileNav } from "./Sidebar";
import { MemberThemeContext } from "../appearance/memberThemeContext";
import { BackgroundMotionContext } from "../appearance/backgroundMotionContext";

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
  it("places the palette above the compliance link and More at the foot of the rail", () => {
    render(
      <MemberThemeContext.Provider
        value={{ memberTheme: "sakura", setMemberTheme: vi.fn() }}
      >
        <BackgroundMotionContext.Provider
          value={{
            motionEnabled: true,
            motionRequested: true,
            setMotionRequested: vi.fn(),
          }}
        >
          <Sidebar
            activePage="home"
            onNavigate={vi.fn()}
            setShowComposeMenu={vi.fn()}
          />
        </BackgroundMotionContext.Provider>
      </MemberThemeContext.Provider>
    );
    const appearance = screen.getByRole("button", { name: "Appearance" });
    const more = screen.getByRole("button", { name: "More" });
    const compliance = screen.getByTitle("18 USC §2257 Compliance Statement");
    expect(
      appearance.compareDocumentPosition(more) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      appearance.compareDocumentPosition(compliance) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(appearance).toHaveClass("member-nav-item-trigger");
  });

  it.each([
    ["home", "Home", "path", "fill"],
    ["store", "Store", "path:nth-child(2)", "stroke"],
    ["promotions", "Promos", "circle", "fill"],
  ])(
    "keeps separate theme-aware silhouette and interior colors for %s",
    (activePage, label, detailSelector, detailAttribute) => {
      renderSidebar({ activePage });
      const icon = screen
        .getByRole("button", { name: label })
        .querySelector("svg");
      expect(icon).toHaveClass("member-nav-icon");
      expect(icon.firstElementChild).toHaveAttribute(
        "fill",
        "var(--member-nav-icon-fill, #111)"
      );
      const detail =
        activePage === "home"
          ? icon.lastElementChild
          : icon.querySelector(detailSelector);
      expect(detail).toHaveAttribute(
        detailAttribute,
        "var(--member-nav-icon-detail, white)"
      );
    }
  );

  it("uses the theme-aware foreground for both active Connect figures", () => {
    renderSidebar({ activePage: "connect" });
    const icon = screen
      .getByRole("button", { name: "Connect" })
      .querySelector("svg");
    expect(icon).toHaveClass("member-nav-icon");
    Array.from(icon.children).forEach((shape) => {
      expect(shape).toHaveAttribute(
        "stroke",
        "var(--member-nav-icon-fill, #111)"
      );
    });
  });

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
