import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StorePage from "./StorePage";

// Render the page in its ready state; the async seam is covered elsewhere.
vi.mock("../lib/useSimulatedFetch", () => ({
  useSimulatedFetch: () => ({ status: "ready", retry: () => {} }),
}));

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  Element.prototype.scrollIntoView = vi.fn();
});

function renderStore() {
  return render(
    <MemoryRouter>
      <StorePage />
    </MemoryRouter>
  );
}

/** Assert `first` appears before `second` in document order. */
function expectBefore(first, second) {
  expect(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
}

describe("StorePage", () => {
  it("initially opens the All tab", () => {
    renderStore();
    // The active tab is the only pressed "All" button (the price filter's
    // "All" option carries no aria-pressed state).
    expect(
      screen.getByRole("button", { name: "All", pressed: true })
    ).toBeInTheDocument();
    expect(screen.getByText("From your subscriptions")).toBeInTheDocument();
  });

  it("orders the All shelves: subscriptions, then followed, then recommended", () => {
    renderStore();
    const subs = screen.getByText("From your subscriptions");
    const followed = screen.getByText("From creators you follow");
    const recommended = screen.getByText("Recommended for you");
    expectBefore(subs, followed);
    expectBefore(followed, recommended);
  });

  it("orders the sidebar: Subscriptions, then Filters, then Followed", () => {
    renderStore();
    const sidebar = screen.getByTestId("store-sidebar");
    const subs = within(sidebar).getByText("Subscriptions");
    const price = within(sidebar).getByText("Price");
    const followed = within(sidebar).getByText("Followed");
    expectBefore(subs, price);
    expectBefore(price, followed);
  });

  it("groups items by membership without repeating them across shelves", () => {
    renderStore();
    const subsShelf = screen.getByTestId("all-shelf-subscriptions");
    const followedShelf = screen.getByTestId("all-shelf-followed");
    const recommendedShelf = screen.getByTestId("all-shelf-recommended");

    // Subscribed creator content only in the subscriptions shelf.
    expect(within(subsShelf).getAllByText("Luna Bloom").length).toBeGreaterThan(
      0
    );
    expect(within(followedShelf).queryByText("Luna Bloom")).toBeNull();
    expect(within(recommendedShelf).queryByText("Luna Bloom")).toBeNull();

    // Followed (free) creator content only in the followed shelf.
    expect(
      within(followedShelf).getAllByText("Mika Rose").length
    ).toBeGreaterThan(0);
    expect(within(subsShelf).queryByText("Mika Rose")).toBeNull();
    expect(within(recommendedShelf).queryByText("Mika Rose")).toBeNull();

    // No item title appears twice across the three shelves.
    const titles = [subsShelf, followedShelf, recommendedShelf].flatMap(
      (shelf) =>
        within(shelf)
          .getAllByRole("img")
          .map((img) => img.getAttribute("alt"))
    );
    expect(new Set(titles).size).toBeGreaterThan(0);
  });

  it("exposes a visible filter control for mobile/tablet", () => {
    renderStore();
    expect(
      screen.getByRole("button", { name: /open filters/i })
    ).toBeInTheDocument();
  });
});
