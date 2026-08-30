import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

function renderLayout({
  activePage = "home",
  visualVariant,
  memberTheme,
  withAuth = false,
  onComposePost,
  onComposeMoment,
} = {}) {
  const content = (
    <MemberLayout
      activePage={activePage}
      visualVariant={visualVariant}
      memberTheme={memberTheme}
      onComposePost={onComposePost}
      onComposeMoment={onComposeMoment}
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

  it("selects the Midnight City backdrop exclusively", () => {
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

  it("provides working post and moment editors even on a route without page-owned composers", async () => {
    const user = userEvent.setup();
    const view = renderLayout({ activePage: "settings" });
    const sidebar = within(
      view.container.querySelector(".member-glass-rail-left")
    );

    await user.click(
      sidebar.getByRole("button", { name: "Create", exact: true })
    );
    expect(
      sidebar.getByRole("button", { name: "Create Moment", exact: true })
    ).toBeInTheDocument();
    await user.click(
      sidebar.getByRole("button", { name: "Create Post", exact: true })
    );

    const post = within(screen.getByRole("dialog", { name: "Create Post" }));
    await user.type(
      post.getByPlaceholderText("Post a new drop..."),
      "My draft"
    );
    expect(
      post.getByRole("button", { name: "Post", exact: true })
    ).toBeDisabled();
    await user.click(post.getByRole("checkbox"));
    expect(
      post.getByRole("button", { name: "Post", exact: true })
    ).toBeEnabled();
    await user.click(post.getByRole("button", { name: "Close" }));

    await user.click(
      sidebar.getByRole("button", { name: "Create", exact: true })
    );
    await user.click(
      sidebar.getByRole("button", { name: "Create Post", exact: true })
    );
    const freshPost = within(
      screen.getByRole("dialog", { name: "Create Post" })
    );
    expect(freshPost.getByPlaceholderText("Post a new drop...")).toHaveValue(
      ""
    );
    expect(freshPost.getByRole("checkbox")).not.toBeChecked();
    await user.click(freshPost.getByRole("button", { name: "Close" }));

    const mobile = within(
      view.container.querySelector(".member-glass-mobile-nav")
    );
    await user.click(
      mobile.getByRole("button", { name: "Create", exact: true })
    );
    await user.click(
      mobile.getByRole("button", { name: "Create Moment", exact: true })
    );
    const moment = within(
      screen.getByRole("dialog", { name: "Create Moment" })
    );
    expect(moment.getByRole("button", { name: "Share Moment" })).toBeDisabled();
    await user.click(moment.getByRole("button", { name: "Text", exact: true }));
    expect(moment.getByRole("button", { name: "Share Moment" })).toBeDisabled();
    await user.click(moment.getByRole("checkbox"));
    expect(moment.getByRole("button", { name: "Share Moment" })).toBeEnabled();
    await user.click(moment.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserves page-owned creation callbacks without also opening a fallback", async () => {
    const user = userEvent.setup();
    const onComposePost = vi.fn();
    const onComposeMoment = vi.fn();
    const view = renderLayout({ onComposePost, onComposeMoment });
    const sidebar = within(
      view.container.querySelector(".member-glass-rail-left")
    );

    await user.click(
      sidebar.getByRole("button", { name: "Create", exact: true })
    );
    await user.click(
      sidebar.getByRole("button", { name: "Create Post", exact: true })
    );
    expect(onComposePost).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(
      sidebar.getByRole("button", { name: "Create", exact: true })
    );
    await user.click(
      sidebar.getByRole("button", { name: "Create Moment", exact: true })
    );
    expect(onComposeMoment).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
