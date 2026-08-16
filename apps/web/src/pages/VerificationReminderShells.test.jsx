import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import CreatorDashboardPage from "./CreatorDashboardPage";
import OasisPage from "./OasisPage";
import WalletPage from "./WalletPage";

vi.mock("../lib/useSimulatedFetch", () => ({
  useSimulatedFetch: () => ({ status: "ready", retry: vi.fn() }),
}));

const unverifiedUser = {
  id: "7024fc48-182a-4544-b341-046837db9d2f",
  email: "member@pumdoki.example",
  displayName: "Sample Member",
  role: "MEMBER",
  createdAt: "2026-08-02T01:00:00.000Z",
  emailVerified: false,
};

const shells = [
  {
    name: "wallet",
    page: () => <WalletPage onBack={vi.fn()} />,
  },
  {
    name: "Oasis",
    page: () => <OasisPage onBack={vi.fn()} />,
  },
  {
    name: "creator dashboard",
    page: () => <CreatorDashboardPage onBack={vi.fn()} onLogout={vi.fn()} />,
  },
];

beforeEach(() => window.sessionStorage.clear());
afterEach(() => cleanup());

describe.each(shells)("$name verification reminder shell", ({ page }) => {
  it("mounts the in-flow reminder immediately below the shell header", () => {
    render(
      <AuthContext.Provider
        value={{ user: unverifiedUser, requestVerification: vi.fn() }}
      >
        {page()}
      </AuthContext.Provider>
    );

    const reminder = screen.getByRole("complementary", {
      name: "Email verification",
    });

    expect(reminder.previousElementSibling?.tagName).toBe("HEADER");
    expect(reminder.className).not.toMatch(/\b(?:fixed|absolute|sticky)\b/);
  });
});
