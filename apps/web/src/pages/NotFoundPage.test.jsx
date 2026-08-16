import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import NotFoundPage from "./NotFoundPage";

function renderPage(
  status,
  { entries = ["/missing-page"], historyIndex, refreshSession = vi.fn() } = {}
) {
  window.history.replaceState(
    historyIndex === undefined ? null : { idx: historyIndex },
    "",
    window.location.href
  );

  return render(
    <AuthContext.Provider value={{ status, user: null, refreshSession }}>
      <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
        <Routes>
          <Route path="/login" element={<div>Login screen</div>} />
          <Route path="/home" element={<div>Member home</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NotFoundPage", () => {
  it("gives an anonymous visitor safe sign-in and Back options", async () => {
    renderPage("unauthenticated");

    expect(
      screen.getByRole("heading", { name: "This page wandered off." })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Go back" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Login screen")).toBeVisible();
  });

  it("uses sign in as the safe Back fallback on a direct anonymous entry", async () => {
    renderPage("unauthenticated");

    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(screen.getByText("Login screen")).toBeVisible();
  });

  it("gives an authenticated visitor Home as the safe destination", async () => {
    renderPage("authenticated");

    expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Go home" }));
    expect(screen.getByText("Member home")).toBeVisible();
  });

  it("uses Home as the safe Back fallback on a direct authenticated entry", async () => {
    renderPage("authenticated");

    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(screen.getByText("Member home")).toBeVisible();
  });

  it("returns to an earlier in-app route when router history is available", async () => {
    renderPage("authenticated", {
      entries: ["/home", "/missing-page"],
      historyIndex: 1,
    });

    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(screen.getByText("Member home")).toBeVisible();
  });

  it("does not guess the visitor's session while restoration is pending", () => {
    renderPage("loading");

    expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Go home" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Checking session…" })
    ).toBeDisabled();
  });

  it("offers session retry instead of treating an outage as anonymous", async () => {
    const refreshSession = vi.fn().mockResolvedValue(null);
    renderPage("unavailable", { refreshSession });

    expect(screen.queryByRole("button", { name: "Sign in" })).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Retry session" })
    );
    expect(refreshSession).toHaveBeenCalledOnce();
  });
});
