import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MomentAvatar from "./MomentAvatar";

const avatar = "https://images.example/avatar.jpg";

describe("MomentAvatar", () => {
  it("renders Add Moment as a plain circular portrait without a heart ring", () => {
    const { container } = render(
      <MomentAvatar src={avatar} name="own" type="own" />
    );

    const shape = container.querySelector(
      '[data-moment-avatar-shape="circle"]'
    );
    expect(shape).toBeInTheDocument();
    expect(shape.querySelector("circle")).toBeInTheDocument();
    expect(shape.querySelector("path")).toBeNull();
    expect(shape.querySelector("[data-moment-ring]")).toBeNull();
  });

  it.each(["regular", "private"])(
    "keeps %s creator Moments heart-shaped",
    (type) => {
      const { container } = render(
        <MomentAvatar src={avatar} name={type} type={type} />
      );

      expect(
        container.querySelector('[data-moment-avatar-shape="heart"]')
      ).toBeInTheDocument();
      expect(container.querySelector("[data-moment-ring]")).toHaveAttribute(
        "opacity",
        "1"
      );
    }
  );

  it("keeps viewed creator Moments heart-shaped with a muted ring", () => {
    const { container } = render(
      <MomentAvatar src={avatar} name="viewed" type="regular" viewed />
    );

    expect(
      container.querySelector('[data-moment-avatar-shape="heart"]')
    ).toBeInTheDocument();
    expect(container.querySelector("[data-moment-ring]")).toHaveAttribute(
      "opacity",
      "0.45"
    );
  });
});
