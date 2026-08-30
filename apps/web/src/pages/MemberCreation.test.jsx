import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import ProfilePage from "./ProfilePage";
import ConnectPage from "./ConnectPage";
import StorePage from "./StorePage";
import PromotionsPage from "./PromotionsPage";

vi.mock("../lib/useSimulatedFetch", () => ({
  useSimulatedFetch: () => ({ status: "ready", retry: vi.fn() }),
}));

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function LocationMarker() {
  return <output data-testid="current-route">{useLocation().pathname}</output>;
}

describe.each([
  ["Home", "/home", HomePage],
  ["Profile", "/profile", ProfilePage],
  ["Connect", "/connect", ConnectPage],
  ["Store", "/store", StorePage],
  ["Promotions", "/promotions", PromotionsPage],
])("%s creation menu", (_name, route, Page) => {
  it("offers both editors on desktop and mobile without leaving the current page", async () => {
    const user = userEvent.setup();
    const view = render(
      <MemoryRouter initialEntries={[route]}>
        <Page />
        <LocationMarker />
      </MemoryRouter>
    );

    for (const nav of [
      view.container.querySelector(".member-glass-rail-left"),
      view.container.querySelector(".member-glass-mobile-nav"),
    ]) {
      const controls = within(nav);
      await user.click(
        controls.getByRole("button", { name: "Create", exact: true })
      );
      expect(
        controls.getByRole("button", { name: "Create Moment", exact: true })
      ).toBeInTheDocument();
      await user.click(
        controls.getByRole("button", { name: "Create Post", exact: true })
      );

      const post = within(screen.getByRole("dialog", { name: "Create Post" }));
      expect(
        post.getByRole("button", { name: "Post", exact: true })
      ).toBeDisabled();
      await user.click(post.getByRole("checkbox"));
      expect(
        post.getByRole("button", { name: "Post", exact: true })
      ).toBeEnabled();
      await user.click(post.getByRole("button", { name: "Close" }));

      await user.click(
        controls.getByRole("button", { name: "Create", exact: true })
      );
      await user.click(
        controls.getByRole("button", { name: "Create Moment", exact: true })
      );
      const moment = within(
        screen.getByRole("dialog", { name: "Create Moment" })
      );
      expect(
        moment.getByRole("button", { name: "Share Moment" })
      ).toBeDisabled();
      await user.click(
        moment.getByRole("button", { name: "Text", exact: true })
      );
      await user.click(moment.getByRole("checkbox"));
      expect(
        moment.getByRole("button", { name: "Share Moment" })
      ).toBeEnabled();
      await user.click(moment.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByTestId("current-route")).toHaveTextContent(route);
    }
  });
});
