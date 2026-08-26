import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BackgroundMotionProvider from "../appearance/BackgroundMotionProvider";
import { BACKGROUND_MOTION_STORAGE_KEY } from "../appearance/backgroundMotionContext";
import SakuraBackdrop from "./SakuraBackdrop";

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
      <SakuraBackdrop />
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

describe("SakuraBackdrop", () => {
  it("adds five soft responsive petals without making the scene interactive", () => {
    renderBackdrop();
    const backdrop = screen.getByTestId("sakura-backdrop");
    const petals = [...backdrop.querySelectorAll("[data-motion-petal]")];

    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveAttribute("data-scene", "ambient-motion");
    expect(backdrop).toHaveAttribute("data-background-motion", "on");
    expect(backdrop).toHaveClass("sakura-backdrop");
    expect(backdrop.querySelector("button, a, input")).toBeNull();
    expect(screen.getByTestId("sakura-motion-overlay")).toBeInTheDocument();
    expect(petals).toHaveLength(5);
    expect(
      petals.every((petal) =>
        petal.style.getPropertyValue("--petal-left").includes("clamp(")
      )
    ).toBe(true);
    expect(
      petals
        .slice(0, 3)
        .every((petal) =>
          Boolean(petal.style.getPropertyValue("--petal-mobile-left"))
        )
    ).toBe(true);
    expect(
      petals.filter((petal) =>
        petal.classList.contains("sakura-backdrop__floating-petal--desktop")
      )
    ).toHaveLength(2);
    expect(
      Math.max(
        ...petals.map((petal) =>
          Number(petal.style.getPropertyValue("--petal-opacity"))
        )
      )
    ).toBeLessThanOrEqual(0.58);
  });

  it("keeps the original scene static when the browser opt-out is saved", () => {
    window.localStorage.setItem(BACKGROUND_MOTION_STORAGE_KEY, "off");
    renderBackdrop();
    const backdrop = screen.getByTestId("sakura-backdrop");

    expect(backdrop).toHaveAttribute("data-scene", "static");
    expect(backdrop).toHaveAttribute("data-background-motion", "off");
    expect(backdrop).toBeEmptyDOMElement();
  });

  it("keeps the scene static when the device requests reduced motion", () => {
    setReducedMotion(true);
    renderBackdrop();
    const backdrop = screen.getByTestId("sakura-backdrop");

    expect(backdrop).toHaveAttribute("data-scene", "static");
    expect(backdrop).toHaveAttribute("data-background-motion", "off");
    expect(backdrop).toBeEmptyDOMElement();
  });
});
