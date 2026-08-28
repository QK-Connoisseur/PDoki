import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import MemberLayout from "./MemberLayout";

const auth = {
  user: {
    id: "21683ebe-d9fe-45a6-a914-2f03d91b76af",
    email: "member@pumdoki.example",
    displayName: "Sample Member",
    role: "MEMBER",
    createdAt: "2026-07-29T00:00:00.000Z",
    emailVerified: false,
  },
  logout: vi.fn(),
  requestVerification: vi.fn(),
};

function renderLayout({ visualVariant, memberTheme, withAuth = false } = {}) {
  const content = (
    <MemberLayout
      activePage="home"
      visualVariant={visualVariant}
      memberTheme={memberTheme}
    >
      <main>Feed content</main>
    </MemberLayout>
  );

  return render(
    <MemoryRouter>
      {withAuth ? (
        <AuthContext.Provider value={auth}>{content}</AuthContext.Provider>
      ) : (
        content
      )}
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true });
});

describe("MemberLayout", () => {
  it("uses the Sakura scene across the member shell with an explicit opt-out", () => {
    const sakura = renderLayout();
    expect(screen.getByTestId("sakura-backdrop")).toHaveAttribute(
      "data-scene",
      "static"
    );
    expect(
      sakura.container.querySelector('[data-member-visual="sakura-glass"]')
    ).toBeInTheDocument();
    expect(
      sakura.container.querySelector('[data-member-theme="sakura"]')
    ).toBeInTheDocument();

    sakura.unmount();
    const standard = renderLayout({ memberTheme: "none" });
    expect(screen.queryByTestId("sakura-backdrop")).not.toBeInTheDocument();
    expect(
      standard.container.querySelector('[data-member-visual="sakura-glass"]')
    ).toBeInTheDocument();
    expect(
      standard.container.querySelector('[data-member-theme="none"]')
    ).toBeInTheDocument();

    standard.unmount();
    const materialOptOut = renderLayout({ visualVariant: "default" });
    expect(screen.queryByTestId("sakura-backdrop")).not.toBeInTheDocument();
    expect(
      materialOptOut.container.querySelector('[data-member-visual="default"]')
    ).toBeInTheDocument();
  });

  it("selects the Dark Nite city backdrop exclusively", () => {
    const darkKnight = renderLayout({ memberTheme: "dark-knight" });

    expect(
      darkKnight.container.querySelector('[data-member-theme="dark-knight"]')
    ).toBeInTheDocument();
    expect(screen.getByTestId("dark-knight-backdrop")).toHaveAttribute(
      "data-scene",
      "static"
    );
    expect(screen.queryByTestId("sakura-backdrop")).not.toBeInTheDocument();
  });

  it("keeps the verification reminder in the center column between the rails", () => {
    const view = renderLayout({
      visualVariant: "sakura-glass",
      withAuth: true,
    });
    const centerColumn = view.container.querySelector(
      "[data-member-center-column]"
    );
    expect(centerColumn).not.toBeNull();
    expect(
      within(centerColumn).getByRole("complementary", {
        name: "Email verification",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Chat sidebar" })
    ).toBeInTheDocument();
  });
});
