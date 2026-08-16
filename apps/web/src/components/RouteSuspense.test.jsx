import { lazy } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RouteSuspense from "./RouteSuspense";

describe("RouteSuspense", () => {
  it("announces loading until a route module resolves", async () => {
    let resolveRoute;
    const LazyPage = lazy(
      () =>
        new Promise((resolve) => {
          resolveRoute = resolve;
        })
    );

    render(
      <RouteSuspense>
        <LazyPage />
      </RouteSuspense>
    );

    expect(screen.getByRole("main", { name: "Loading page" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading page…");

    await act(async () => {
      resolveRoute({ default: () => <h1>Route ready</h1> });
    });

    expect(
      screen.queryByRole("main", { name: "Loading page" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Route ready" })).toBeVisible();
  });
});
