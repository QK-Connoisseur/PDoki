import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BackgroundMotionProvider from "../appearance/BackgroundMotionProvider";
import { BACKGROUND_MOTION_STORAGE_KEY } from "../appearance/backgroundMotionContext";
import DarkKnightBackdrop from "./DarkKnightBackdrop";

function setReducedMotion(matches) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

function renderBackdrop() {
  return render(
    <BackgroundMotionProvider>
      <DarkKnightBackdrop />
    </BackgroundMotionProvider>
  );
}

beforeEach(() => {
  const values = new Map();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
    clear: vi.fn(() => values.clear()),
  });
  setReducedMotion(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DarkKnightBackdrop", () => {
  it("adds five noninteractive atmospheric layers over the static city", () => {
    renderBackdrop();
    const backdrop = screen.getByTestId("dark-knight-backdrop");
    const layers = backdrop.querySelectorAll("[data-motion-element]");

    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveAttribute("data-scene", "ambient-motion");
    expect(backdrop).toHaveAttribute("data-background-motion", "on");
    expect(backdrop).toHaveClass("member-backdrop", "dark-knight-backdrop");
    expect(backdrop.querySelector("button, a, input")).toBeNull();
    expect(
      screen.getByTestId("dark-knight-motion-overlay")
    ).toBeInTheDocument();
    expect(layers).toHaveLength(5);
    expect(
      backdrop.querySelectorAll(".dark-knight-backdrop__atmosphere--desktop")
    ).toHaveLength(2);
  });

  it("keeps the generated city static when the browser opt-out is saved", () => {
    window.localStorage.setItem(BACKGROUND_MOTION_STORAGE_KEY, "off");
    renderBackdrop();
    const backdrop = screen.getByTestId("dark-knight-backdrop");

    expect(backdrop).toHaveAttribute("data-scene", "static");
    expect(backdrop).toHaveAttribute("data-background-motion", "off");
    expect(backdrop).toBeEmptyDOMElement();
  });

  it("keeps the generated city static when the device requests reduced motion", () => {
    setReducedMotion(true);
    renderBackdrop();
    const backdrop = screen.getByTestId("dark-knight-backdrop");

    expect(backdrop).toHaveAttribute("data-scene", "static");
    expect(backdrop).toHaveAttribute("data-background-motion", "off");
    expect(backdrop).toBeEmptyDOMElement();
  });
});
