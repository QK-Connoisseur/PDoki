import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ConnectPage from "./ConnectPage";
import { creators } from "../fixtures/connectCreators";
import { getLowestOffer, formatServicePrice } from "../utils/serviceOffers";

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

function renderConnect() {
  return render(
    <MemoryRouter>
      <ConnectPage />
    </MemoryRouter>
  );
}

describe("ConnectPage", () => {
  it("shows each creator's lowest E-Chat offer in the filtered E-Chat view", () => {
    renderConnect();
    // The E-Chat rail tab (its accessible name includes the description line;
    // the "Show All" section button also mentions E-Chat, so match uniquely).
    fireEvent.click(
      screen.getByRole("button", { name: /e-chat text & messages/i })
    );

    const lunaLowestChat = formatServicePrice(
      getLowestOffer(
        creators.find((c) => c.username === "lunabloom"),
        "chat"
      )
    );
    expect(lunaLowestChat).toBe("10/30 min");
    // Front badge + back face of Luna's card both use the shared helper.
    expect(screen.getAllByText(lunaLowestChat).length).toBeGreaterThanOrEqual(
      2
    );
    // Her more expensive chat offer is never shown.
    expect(screen.queryByText("18/hour")).not.toBeInTheDocument();
  });

  it('prefixes "From" on cards in the New to Pumdoki section (no category context)', () => {
    renderConnect();
    const kiraLowest = formatServicePrice(
      getLowestOffer(
        creators.find((c) => c.username === "kiradawn"),
        null
      ),
      { from: true }
    );
    expect(kiraLowest).toBe("From 4/30 min");
    expect(screen.getAllByText(kiraLowest).length).toBeGreaterThan(0);
  });
});
