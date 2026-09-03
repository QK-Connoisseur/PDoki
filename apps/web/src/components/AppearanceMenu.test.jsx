import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MemberThemeProvider from "../appearance/MemberThemeProvider";
import { MEMBER_THEME_STORAGE_KEY } from "../appearance/memberThemeContext";
import AppearanceMenu from "./AppearanceMenu";

beforeEach(() => {
  const values = new Map();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
  });
});

afterEach(() => vi.unstubAllGlobals());

function renderAppearance(props = {}) {
  return render(
    <MemberThemeProvider>
      <AppearanceMenu {...props} />
      <button type="button">Outside control</button>
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
    expect(trigger).toHaveAttribute("title", "Themes");

    await user.click(trigger);

    expect(onOpen).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Themes" })).toBeInTheDocument();
    expect(
      screen.getByText("Your theme is remembered on this browser.")
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

  it("restores the saved theme without exposing background motion controls", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(MEMBER_THEME_STORAGE_KEY, "dark-knight");
    const view = renderAppearance();
    await user.click(screen.getByRole("button", { name: "Appearance" }));
    expect(screen.getByRole("radio", { name: "Midnight City" })).toBeChecked();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByText(/background motion/i)).not.toBeInTheDocument();
    view.unmount();
    renderAppearance();
    await user.click(screen.getByRole("button", { name: "Appearance" }));
    expect(screen.getByRole("radio", { name: "Midnight City" })).toBeChecked();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
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
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("does not expose an inert palette in a shell without appearance providers", () => {
    render(<AppearanceMenu />);
    expect(
      screen.queryByRole("button", { name: "Appearance" })
    ).not.toBeInTheDocument();
  });
});
