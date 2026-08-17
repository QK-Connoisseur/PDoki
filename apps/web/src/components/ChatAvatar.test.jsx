import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChatAvatar from "./ChatAvatar";

describe("ChatAvatar", () => {
  it("keeps decoration cosmetic while status and unread badges remain visible", () => {
    const { container } = render(
      <ChatAvatar
        src="/luna.jpg"
        alt="Luna Bloom"
        size={56}
        status="online"
        unreadCount={12}
        decoration="sakura-cat"
      />
    );

    expect(screen.getByRole("img", { name: "Luna Bloom" })).toBeVisible();
    expect(screen.getByRole("img", { name: "Status: Online" })).toBeVisible();
    expect(screen.getByText("9+")).toBeVisible();

    const decoration = container.querySelector(
      '[data-avatar-decoration="sakura-cat"]'
    );
    expect(decoration).toHaveAttribute("aria-hidden", "true");
    expect(decoration).toHaveAttribute("alt", "");
    expect(decoration).toHaveClass("z-10");
    expect(screen.getByText("9+")).toHaveClass("z-20");
  });

  it("can intentionally render a small message avatar without a decoration", () => {
    const { container } = render(
      <ChatAvatar
        src="/luna.jpg"
        alt="Luna Bloom"
        size={26}
        status="online"
        showStatus={false}
      />
    );

    expect(screen.getByRole("img", { name: "Luna Bloom" })).toBeVisible();
    expect(container.querySelector("[data-avatar-decoration]")).toBeNull();
  });
});
