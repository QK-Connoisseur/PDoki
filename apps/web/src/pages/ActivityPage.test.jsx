import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ActivityPage from "./ActivityPage";

// The shared shell has its own navigation/theme tests; exercise activity here.
vi.mock("../components/MemberLayout", () => ({
  default: ({ children }) => <>{children}</>,
}));

function renderActivity() {
  render(
    <MemoryRouter>
      <ActivityPage />
    </MemoryRouter>
  );
  return within(screen.getByRole("region", { name: "Activity history" }));
}

describe("ActivityPage", () => {
  it("clearly identifies sample history and uses existing billing navigation", () => {
    const history = renderActivity();
    expect(
      screen.getByRole("heading", { name: "Your Activity", level: 1 })
    ).toBeInTheDocument();
    const disclosure = screen.getByRole("note", { name: "Activity preview" });
    expect(disclosure).toHaveTextContent("Preview — example activity");
    expect(disclosure).toHaveTextContent("not your account history");
    expect(disclosure).toHaveTextContent("No real purchases or payments");
    expect(screen.getByRole("link", { name: "Billing" })).toHaveAttribute(
      "href",
      "/billing"
    );
    expect(history.getAllByRole("listitem")).toHaveLength(11);
    expect(history.getByRole("status")).toHaveTextContent(
      "11 examples · Newest first"
    );
  });

  it("separates liked posts, purchases, subscriptions, and payment history", async () => {
    const user = userEvent.setup();
    const history = renderActivity();

    await user.click(screen.getByRole("button", { name: /^Likes/ }));
    expect(history.getAllByRole("listitem")).toHaveLength(3);
    expect(history.getByText("Golden hour photo diary")).toBeInTheDocument();
    expect(history.queryByText("Photo set payment")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Purchases/ }));
    expect(history.getAllByRole("listitem")).toHaveLength(3);
    expect(history.getByText("$8.50")).toBeInTheDocument();
    expect(history.queryByText("Creator tip")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Subscriptions/ }));
    expect(history.getAllByRole("listitem")).toHaveLength(2);
    expect(history.getByText("Gold Petal membership")).toBeInTheDocument();
    expect(history.getByText("$19.99")).toHaveTextContent("$19.99/mo");

    await user.click(screen.getByRole("button", { name: /^Payments/ }));
    expect(history.getAllByRole("listitem")).toHaveLength(3);
    expect(history.getByText("Creator tip")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Payments/, pressed: true })
    ).toBeInTheDocument();
  });

  it("combines category, search, and month filters and resets an empty result", async () => {
    const user = userEvent.setup();
    const history = renderActivity();
    await user.click(screen.getByRole("button", { name: /^Likes/ }));
    await user.type(
      screen.getByRole("searchbox", { name: "Search activity" }),
      " LUNA "
    );
    expect(history.getAllByRole("listitem")).toHaveLength(1);
    expect(history.getByText("Golden hour photo diary")).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Activity month" }),
      "2026-08"
    );
    expect(history.queryAllByRole("listitem")).toHaveLength(0);
    expect(
      history.getByRole("heading", { name: "No matching activity" })
    ).toBeInTheDocument();
    expect(history.getByRole("status")).toHaveTextContent("0 examples");

    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(history.getAllByRole("listitem")).toHaveLength(11);
    expect(
      screen.getByRole("searchbox", { name: "Search activity" })
    ).toHaveValue("");
    expect(
      screen.getByRole("combobox", { name: "Activity month" })
    ).toHaveValue("all");
    expect(
      screen.getByRole("button", { name: /^All activity/, pressed: true })
    ).toBeInTheDocument();
  });
});
