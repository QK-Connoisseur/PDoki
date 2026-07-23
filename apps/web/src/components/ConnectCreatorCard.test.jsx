import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConnectCreatorCard from "./ConnectCreatorCard";

const creator = {
  id: 1,
  name: "Luna Bloom",
  username: "lunabloom",
  avatar: "https://demo.example/avatar.jpg",
  photo: "https://demo.example/photo.jpg",
  level: "gold",
  status: "online",
  audioIntro: "https://demo.example/audio.mp3",
  description: "Friendly conversations.",
  offers: [
    { service: "chat", vesos: 12, unit: "30 min" },
    { service: "chat", vesos: 10, unit: "30 min" },
    { service: "video", vesos: 30, unit: "30 min" },
    { service: "game", vesos: 8, unit: "game" },
  ],
};

describe("ConnectCreatorCard", () => {
  it("shows the lowest offer for the active service category", () => {
    render(<ConnectCreatorCard creator={creator} serviceType="chat" />);
    expect(screen.getAllByText("10/30 min").length).toBeGreaterThan(0);
    expect(screen.queryByText("12/30 min")).not.toBeInTheDocument();
  });

  it("shows the same formatted Veso price on the front badge and the back face", () => {
    render(<ConnectCreatorCard creator={creator} serviceType="chat" />);
    expect(screen.getAllByText("10/30 min")).toHaveLength(2);
  });

  it("uses the Veso symbol, not a dollar sign", () => {
    const { container } = render(
      <ConnectCreatorCard creator={creator} serviceType="chat" />
    );
    expect(screen.getAllByRole("img", { name: "Veso" }).length).toBeGreaterThan(
      0
    );
    expect(container.textContent).not.toContain("$");
  });

  it('shows the lowest overall offer prefixed with "From" when no category is selected', () => {
    render(<ConnectCreatorCard creator={creator} serviceType={null} />);
    expect(screen.getAllByText("From 8/game")).toHaveLength(2);
  });

  it("flips via keyboard focus, not only hover", () => {
    const { container } = render(
      <ConnectCreatorCard creator={creator} serviceType="chat" />
    );
    const wrapper = container.firstChild;
    const flippable = wrapper.querySelector("[data-flip]");
    expect(flippable.style.transform).toBe("rotateY(0deg)");
    fireEvent.focus(wrapper);
    expect(flippable.style.transform).toBe("rotateY(180deg)");
    fireEvent.blur(wrapper);
    expect(flippable.style.transform).toBe("rotateY(0deg)");
  });

  it("toggles the flip on click/tap for touch access", () => {
    const { container } = render(
      <ConnectCreatorCard creator={creator} serviceType="chat" />
    );
    const wrapper = container.firstChild;
    const flippable = wrapper.querySelector("[data-flip]");
    fireEvent.click(wrapper);
    expect(flippable.style.transform).toBe("rotateY(180deg)");
    fireEvent.click(wrapper);
    expect(flippable.style.transform).toBe("rotateY(0deg)");
  });

  it("preserves audio intro, profile, and message controls", () => {
    render(<ConnectCreatorCard creator={creator} serviceType="chat" />);
    expect(screen.getAllByTitle("Play audio intro").length).toBe(2);
    expect(
      screen.getByRole("button", { name: /view profile/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /message/i })
    ).toBeInTheDocument();
  });
});
