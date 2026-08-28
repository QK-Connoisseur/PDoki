import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MemberThemeProvider from "./MemberThemeProvider";
import {
  DEFAULT_MEMBER_THEME,
  MEMBER_THEMES,
  MEMBER_THEME_STORAGE_KEY,
  useMemberTheme,
} from "./memberThemeContext";

function ThemeProbe() {
  const { memberTheme, setMemberTheme } = useMemberTheme();

  return (
    <div>
      <output aria-label="Selected theme">{memberTheme}</output>
      <button
        type="button"
        onClick={() => setMemberTheme(MEMBER_THEMES.DARK_KNIGHT)}
      >
        Use Dark Knight
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <MemberThemeProvider>
      <ThemeProbe />
    </MemberThemeProvider>
  );
}

beforeEach(() => {
  const values = new Map();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
    clear: vi.fn(() => values.clear()),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MemberThemeProvider", () => {
  it("defaults to Sakura and persists a valid Dark Knight selection", async () => {
    const user = userEvent.setup();
    renderProvider();

    expect(screen.getByLabelText("Selected theme")).toHaveTextContent(
      DEFAULT_MEMBER_THEME
    );

    await user.click(screen.getByRole("button", { name: "Use Dark Knight" }));

    expect(screen.getByLabelText("Selected theme")).toHaveTextContent(
      MEMBER_THEMES.DARK_KNIGHT
    );
    expect(window.localStorage.getItem(MEMBER_THEME_STORAGE_KEY)).toBe(
      MEMBER_THEMES.DARK_KNIGHT
    );
  });

  it("restores a saved Dark Knight selection without a Sakura-first render", () => {
    window.localStorage.setItem(
      MEMBER_THEME_STORAGE_KEY,
      MEMBER_THEMES.DARK_KNIGHT
    );
    renderProvider();

    expect(screen.getByLabelText("Selected theme")).toHaveTextContent(
      MEMBER_THEMES.DARK_KNIGHT
    );
  });

  it("falls back to Sakura for an unknown stored value", () => {
    window.localStorage.setItem(MEMBER_THEME_STORAGE_KEY, "unknown-theme");
    renderProvider();

    expect(screen.getByLabelText("Selected theme")).toHaveTextContent(
      DEFAULT_MEMBER_THEME
    );
  });

  it("synchronizes the saved selection from another browser tab", () => {
    renderProvider();
    window.localStorage.setItem(
      MEMBER_THEME_STORAGE_KEY,
      MEMBER_THEMES.DARK_KNIGHT
    );
    const storageEvent = new Event("storage");
    Object.defineProperty(storageEvent, "key", {
      value: MEMBER_THEME_STORAGE_KEY,
    });

    fireEvent(window, storageEvent);

    expect(screen.getByLabelText("Selected theme")).toHaveTextContent(
      MEMBER_THEMES.DARK_KNIGHT
    );
  });
});
