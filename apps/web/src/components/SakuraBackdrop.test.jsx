import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SakuraBackdrop from "./SakuraBackdrop";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SakuraBackdrop", () => {
  it("renders only the noninteractive static wallpaper", () => {
    render(<SakuraBackdrop />);
    const backdrop = screen.getByTestId("sakura-backdrop");

    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveAttribute("data-scene", "static");
    expect(backdrop).toHaveClass("sakura-backdrop");
    expect(backdrop).toBeEmptyDOMElement();
    expect(
      backdrop.querySelector("video, canvas, button, a, input")
    ).toBeNull();
  });

  it("ignores the retired browser motion preference, including a saved on value", () => {
    const getItem = vi.fn(() => "on");
    vi.stubGlobal("localStorage", { getItem });

    render(<SakuraBackdrop />);

    expect(screen.getByTestId("sakura-backdrop")).toBeEmptyDOMElement();
    expect(getItem).not.toHaveBeenCalled();
  });
});
