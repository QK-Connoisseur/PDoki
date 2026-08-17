import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Avatar, {
  AVATAR_DECORATION_IDS,
  AVATAR_DECORATIONS,
  resolveAvatarDecoration,
} from "./Avatar";

const PHOTO_SRC = "https://demo.example/avatar.jpg";

describe("Avatar", () => {
  it("renders an undecorated, accessible profile image by default", () => {
    const { container } = render(
      <Avatar src={PHOTO_SRC} alt="Luna Bloom" size={48} />
    );

    expect(screen.getByRole("img", { name: "Luna Bloom" })).toHaveAttribute(
      "src",
      PHOTO_SRC
    );
    expect(container.querySelector("[data-avatar-decoration]")).toBeNull();
    expect(container.querySelector("[data-avatar-root]")).toHaveStyle({
      width: "var(--avatar-size)",
      height: "var(--avatar-size)",
    });
    expect(
      container
        .querySelector("[data-avatar-root]")
        .style.getPropertyValue("--avatar-size")
    ).toBe("48px");
  });

  it("adds a known decoration without adding an accessible image name", () => {
    const { container } = render(
      <Avatar
        src={PHOTO_SRC}
        alt="Mika Rose"
        decoration={AVATAR_DECORATION_IDS.MOON_KITSUNE}
      />
    );

    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("img", { name: "Mika Rose" })).toBeVisible();

    const decoration = container.querySelector("[data-avatar-decoration]");
    expect(decoration).toHaveAttribute("aria-hidden", "true");
    expect(decoration).toHaveAttribute("alt", "");
    expect(decoration).toHaveAttribute("draggable", "false");
    expect(decoration).toHaveAttribute(
      "data-avatar-decoration",
      AVATAR_DECORATION_IDS.MOON_KITSUNE
    );
  });

  it("keeps the existing sakura id as an alias for sakura-cat", () => {
    expect(resolveAvatarDecoration("sakura")).toBe(
      AVATAR_DECORATIONS[AVATAR_DECORATION_IDS.SAKURA_CAT]
    );
  });

  it("fails soft to a plain avatar for an unknown decoration id", () => {
    const { container } = render(
      <Avatar
        src={PHOTO_SRC}
        alt="Airi Vale"
        decoration="not-a-real-decoration"
      />
    );

    expect(screen.getByRole("img", { name: "Airi Vale" })).toBeVisible();
    expect(container.querySelector("[data-avatar-decoration]")).toBeNull();
    expect(resolveAvatarDecoration("not-a-real-decoration")).toBeNull();
    expect(resolveAvatarDecoration("constructor")).toBeNull();
    expect(resolveAvatarDecoration("toString")).toBeNull();
  });

  it("supports responsive CSS lengths and additive classes", () => {
    const { container } = render(
      <Avatar
        src={PHOTO_SRC}
        alt="Reina Noir"
        size="clamp(3rem, 8vw, 7rem)"
        className="profile-avatar"
        imageClassName="ring-2"
        imageStyle={{ filter: "grayscale(0.5)" }}
      />
    );

    const root = container.querySelector("[data-avatar-root]");
    expect(root).toHaveClass("profile-avatar");
    expect(root.style.getPropertyValue("--avatar-size")).toBe(
      "clamp(3rem, 8vw, 7rem)"
    );
    expect(screen.getByRole("img", { name: "Reina Noir" })).toHaveClass(
      "ring-2"
    );
    expect(screen.getByRole("img", { name: "Reina Noir" })).toHaveStyle({
      filter: "grayscale(0.5)",
    });
  });
});
