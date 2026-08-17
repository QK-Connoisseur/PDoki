import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppearanceProvider } from "../appearance/AppearanceProvider";
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

function renderLayout({ visualVariant = "default", withAuth = false } = {}) {
  const content = (
    <AppearanceProvider>
      <MemberLayout activePage="home" visualVariant={visualVariant}>
        <main>Feed content</main>
      </MemberLayout>
    </AppearanceProvider>
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
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

describe("MemberLayout", () => {
  it("opts Home into the Sakura scene without changing the default shell", () => {
    const sakura = renderLayout({ visualVariant: "sakura-glass" });
    expect(screen.getByTestId("sakura-backdrop")).toBeInTheDocument();
    expect(
      sakura.container.querySelector('[data-member-visual="sakura-glass"]')
    ).toBeInTheDocument();

    sakura.unmount();
    const standard = renderLayout();
    expect(screen.queryByTestId("sakura-backdrop")).not.toBeInTheDocument();
    expect(
      standard.container.querySelector('[data-member-visual="default"]')
    ).toBeInTheDocument();
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
