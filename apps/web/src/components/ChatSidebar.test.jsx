import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatSidebar from "./ChatSidebar";

beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
  });
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ChatSidebar shell hooks", () => {
  it("keeps a left-pointing collapsed control and the existing dialog toggle", async () => {
    const user = userEvent.setup();
    render(<ChatSidebar contacts={[]} />);

    const rail = screen.getByRole("complementary", { name: "Chat sidebar" });
    expect(rail).toHaveClass("member-glass-rail", "member-glass-rail-right");

    const expand = screen.getByRole("button", { name: "Expand inbox" });
    expect(expand).toHaveClass("member-chat-expand-toggle");
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(expand.querySelector("path")).toHaveAttribute(
      "d",
      "M15 19l-7-7 7-7"
    );
    expect(expand.querySelector("svg")).not.toHaveClass("rotate-180");

    await user.click(expand);
    expect(screen.getByRole("dialog", { name: "Messages" })).toHaveClass(
      "member-glass-chat-panel"
    );
    expect(
      screen.getByRole("button", { name: "Collapse inbox" })
    ).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Collapse inbox" }));
    expect(
      screen.queryByRole("dialog", { name: "Messages" })
    ).not.toBeInTheDocument();
  });
});
