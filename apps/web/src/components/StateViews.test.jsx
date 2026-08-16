import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoadingState, EmptyState, ErrorState } from "./StateViews";

describe("StateViews", () => {
  it("LoadingState exposes a polite status with its label", () => {
    render(<LoadingState label="Fetching feed…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Fetching feed…");
  });

  it("EmptyState renders title and message", () => {
    render(
      <EmptyState title="No posts" message="Follow a creator to begin." />
    );
    expect(screen.getByText("No posts")).toBeInTheDocument();
    expect(screen.getByText("Follow a creator to begin.")).toBeInTheDocument();
  });

  it("ErrorState calls onRetry when the retry button is clicked", async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Network down" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("ErrorState supports a specific recovery label", async () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        message="A route chunk failed"
        onRetry={onRetry}
        retryLabel="Reload page"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Reload page" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("ErrorState omits the retry button when no handler is given", () => {
    render(<ErrorState message="Network down" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
