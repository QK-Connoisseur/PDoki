import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DarkKnightBackdrop from "./DarkKnightBackdrop";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DarkKnightBackdrop", () => {
  it("renders only the noninteractive static wallpaper", () => {
    render(<DarkKnightBackdrop />);
    const backdrop = screen.getByTestId("dark-knight-backdrop");

    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveAttribute("data-scene", "static");
    expect(backdrop).toHaveClass("member-backdrop", "dark-knight-backdrop");
    expect(backdrop).toBeEmptyDOMElement();
    expect(
      backdrop.querySelector("video, canvas, button, a, input")
    ).toBeNull();
  });

  it("ignores the retired browser motion preference, including a saved on value", () => {
    const getItem = vi.fn(() => "on");
    vi.stubGlobal("localStorage", { getItem });

    render(<DarkKnightBackdrop />);

    expect(screen.getByTestId("dark-knight-backdrop")).toBeEmptyDOMElement();
    expect(getItem).not.toHaveBeenCalled();
  });
});
