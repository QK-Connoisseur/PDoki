import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SakuraBackdrop from "./SakuraBackdrop";

describe("SakuraBackdrop", () => {
  it("is a decorative, static, and noninteractive scene", () => {
    render(<SakuraBackdrop />);
    const backdrop = screen.getByTestId("sakura-backdrop");

    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveAttribute("data-scene", "static");
    expect(backdrop).toHaveClass("sakura-backdrop");
    expect(backdrop.querySelector("button, a, input")).toBeNull();
  });
});
