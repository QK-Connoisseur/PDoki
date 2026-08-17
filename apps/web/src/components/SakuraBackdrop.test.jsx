import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppearanceProvider } from "../appearance/AppearanceProvider";
import SakuraBackdrop from "./SakuraBackdrop";

function renderBackdrop(storedValue = null) {
  const storage = {
    getItem: vi.fn(() => storedValue),
    setItem: vi.fn(),
  };
  return render(
    <AppearanceProvider storage={storage}>
      <SakuraBackdrop />
    </AppearanceProvider>
  );
}

describe("SakuraBackdrop", () => {
  it("is decorative and noninteractive while motion is enabled", () => {
    renderBackdrop();
    const backdrop = screen.getByTestId("sakura-backdrop");

    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveAttribute("data-motion", "running");
    expect(backdrop).toHaveClass("sakura-backdrop");
    expect(backdrop.querySelector("button, a, input")).toBeNull();
  });

  it("keeps the scene but pauses its layers after an explicit opt-out", () => {
    renderBackdrop("disabled");
    expect(screen.getByTestId("sakura-backdrop")).toHaveAttribute(
      "data-motion",
      "paused"
    );
  });
});
