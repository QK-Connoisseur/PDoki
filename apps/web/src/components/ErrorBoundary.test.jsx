import { lazy } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";
import RouteSuspense from "./RouteSuspense";

function BrokenPage() {
  throw new Error("Route module unavailable");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("offers a real reload recovery for a failed routed page", async () => {
    const reloadPage = vi.fn();

    render(
      <ErrorBoundary reloadPage={reloadPage}>
        <BrokenPage />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("This page hit a snag");
    await userEvent.click(screen.getByRole("button", { name: "Reload page" }));
    expect(reloadPage).toHaveBeenCalledOnce();
  });

  it("uses the same reload recovery when a lazy route import rejects", async () => {
    const reloadPage = vi.fn();
    const FailedLazyPage = lazy(() =>
      Promise.reject(new Error("Route chunk unavailable"))
    );

    render(
      <ErrorBoundary reloadPage={reloadPage}>
        <RouteSuspense>
          <FailedLazyPage />
        </RouteSuspense>
      </ErrorBoundary>
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This page hit a snag"
    );
    await userEvent.click(screen.getByRole("button", { name: "Reload page" }));
    expect(reloadPage).toHaveBeenCalledOnce();
  });
});
