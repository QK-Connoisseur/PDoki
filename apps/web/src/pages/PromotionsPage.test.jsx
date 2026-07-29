import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PromotionsPage from "./PromotionsPage";

vi.mock("../lib/useSimulatedFetch", () => ({
  useSimulatedFetch: () => ({ status: "ready", retry: () => {} }),
}));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-07-23T12:00:00Z"));
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

function renderPromotions() {
  return render(
    <MemoryRouter>
      <PromotionsPage />
    </MemoryRouter>
  );
}

function expectBefore(first, second) {
  expect(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
}

describe("PromotionsPage", () => {
  it("orders personalized, ending-soon, and recommended shelves", () => {
    renderPromotions();
    const followed = screen.getByText("Deals from creators you follow");
    const ending = screen.getByRole("heading", { name: "Ending soon" });
    const recommended = screen.getByText("Best for you");
    expectBefore(followed, ending);
    expectBefore(ending, recommended);
  });

  it("shows relationship context, transparent terms, and real expiry data", () => {
    renderPromotions();
    expect(screen.getAllByText("Following").length).toBeGreaterThan(0);
    expect(screen.getByText("Subscribed")).toBeInTheDocument();
    expect(
      screen.getByText("Free for 7 days, then $9.99/month.")
    ).toBeInTheDocument();
    expect(screen.getAllByText(/days? left/i).length).toBeGreaterThan(0);
  });

  it("filters by offer type and sorts by biggest savings", async () => {
    const user = userEvent.setup();
    renderPromotions();

    await user.click(screen.getByRole("button", { name: "Discounts" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: /sort by/i }),
      "savings"
    );

    const section = screen.getByTestId("promotion-section-discount");
    const cards = within(section).getAllByRole("article");
    expect(cards[0]).toHaveTextContent("Massive first-month deal");
    expect(
      screen.getByRole("button", { name: "Discounts", pressed: true })
    ).toBeInTheDocument();
  });
});
