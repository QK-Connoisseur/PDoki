import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MemberThemeProvider from "../appearance/MemberThemeProvider";
import BackgroundMotionProvider from "../appearance/BackgroundMotionProvider";
import { MEMBER_THEME_STORAGE_KEY } from "../appearance/memberThemeContext";
import { BACKGROUND_MOTION_STORAGE_KEY } from "../appearance/backgroundMotionContext";
import AppearanceMenu from "./AppearanceMenu";

let motionListeners;

beforeEach(() => {
  const values = new Map();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
  });
  motionListeners = new Set();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (_, listener) => motionListeners.add(listener),
      removeEventListener: (_, listener) => motionListeners.delete(listener),
    })
  );
});

afterEach(() => vi.unstubAllGlobals());

function renderAppearance(props = {}) {
  return render(
    <MemberThemeProvider>
      <BackgroundMotionProvider>
        <AppearanceMenu {...props} />
        <button type="button">Outside control</button>
      </BackgroundMotionProvider>
    </MemberThemeProvider>
  );
}

describe("AppearanceMenu", () => {
  it("offers both named themes, focuses the selected radio, and saves the selection", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    renderAppearance({ onOpen });
    const trigger = screen.getByRole("button", { name: "Appearance" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(onOpen).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("dialog", { name: "Themes and motion" })
    ).toBeInTheDocument();
    const sakura = screen.getByRole("radio", { name: "Sakura Kiss" });
    const city = screen.getByRole("radio", { name: "Midnight City" });
    expect(sakura).toBeChecked();
    expect(sakura).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(city).toBeChecked();
    expect(city).toHaveFocus();
    expect(window.localStorage.getItem(MEMBER_THEME_STORAGE_KEY)).toBe(
      "dark-knight"
    );
    expect(city.closest("[data-member-theme]")).toHaveAttribute(
      "data-member-theme",
      "dark-knight"
    );

    await user.click(sakura);
    expect(window.localStorage.getItem(MEMBER_THEME_STORAGE_KEY)).toBe(
      "sakura"
    );
  });

  it("turns movement off without changing the theme and restores both saved choices", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(MEMBER_THEME_STORAGE_KEY, "dark-knight");
    const view = renderAppearance();
    await user.click(screen.getByRole("button", { name: "Appearance" }));
    const motion = screen.getByRole("switch", { name: "Background motion" });
    expect(motion).toBeChecked();

    await user.click(motion);

    expect(motion).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Midnight City" })).toBeChecked();
    expect(window.localStorage.getItem(BACKGROUND_MOTION_STORAGE_KEY)).toBe(
      "off"
    );
    view.unmount();
    renderAppearance();
    await user.click(screen.getByRole("button", { name: "Appearance" }));
    expect(screen.getByRole("radio", { name: "Midnight City" })).toBeChecked();
    expect(
      screen.getByRole("switch", { name: "Background motion" })
    ).not.toBeChecked();
  });

  it("honors device reduced motion immediately and explains why motion is unavailable", async () => {
    const user = userEvent.setup();
    renderAppearance();
    await user.click(screen.getByRole("button", { name: "Appearance" }));
    const motion = screen.getByRole("switch", { name: "Background motion" });

    act(() =>
      motionListeners.forEach((listener) => listener({ matches: true }))
    );

    expect(motion).not.toBeChecked();
    expect(motion).toBeDisabled();
    expect(motion).toHaveAccessibleDescription(
      "Off to respect your device’s reduced-motion setting."
    );
    await user.click(motion);
    expect(window.localStorage.setItem).not.toHaveBeenCalled();

    act(() =>
      motionListeners.forEach((listener) => listener({ matches: false }))
    );
    expect(motion).toBeEnabled();
    expect(motion).toBeChecked();
  });

  it("closes with Escape and returns keyboard focus to the palette", async () => {
    const user = userEvent.setup();
    renderAppearance();
    const trigger = screen.getByRole("button", { name: "Appearance" });
    await user.click(trigger);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("dismisses on an outside click, focus leaving the panel, and its close button", async () => {
    const user = userEvent.setup();
    renderAppearance();
    const trigger = screen.getByRole("button", { name: "Appearance" });
    const outside = screen.getByRole("button", { name: "Outside control" });
    await user.click(trigger);
    await user.click(outside);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(outside).toHaveFocus();

    await user.click(trigger);
    await user.tab();
    expect(screen.getByRole("switch")).toHaveFocus();
    await user.tab();
    expect(outside).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close appearance" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("uses the same controls in the compact mobile variant", async () => {
    const user = userEvent.setup();
    renderAppearance({ mobile: true });
    const trigger = screen.getByRole("button", { name: "Appearance" });
    expect(trigger).toHaveClass("member-mobile-nav-item");
    expect(trigger.parentElement).toHaveClass("member-appearance--mobile");
    await user.click(trigger);
    expect(
      screen.getByRole("radio", { name: "Sakura Kiss" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Midnight City" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Background motion" })
    ).toBeInTheDocument();
  });

  it("does not expose an inert palette in a shell without appearance providers", () => {
    render(<AppearanceMenu />);
    expect(
      screen.queryByRole("button", { name: "Appearance" })
    ).not.toBeInTheDocument();
  });
});
