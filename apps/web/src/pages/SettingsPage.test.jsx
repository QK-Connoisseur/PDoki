import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/authContext";
import SettingsPage from "./SettingsPage";

const auth = {
  user: {
    id: "21683ebe-d9fe-45a6-a914-2f03d91b76af",
    email: "member@pumdoki.example",
    displayName: "Sample Member",
    role: "MEMBER",
    createdAt: "2026-07-29T00:00:00.000Z",
    emailVerified: true,
  },
  logout: vi.fn(),
  updateUser: vi.fn(),
};

const currentSession = {
  id: "5ac3d89f-b6d3-4e72-a928-8cb19c607607",
  createdAt: "2026-08-01T12:00:00.000Z",
  expiresAt: "2026-08-31T12:00:00.000Z",
  ipAddress: "127.0.0.1",
  userAgent: "Chrome/140",
  current: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

function makeApi(overrides = {}) {
  return {
    getPreferences: vi.fn().mockResolvedValue({ showExplicitContent: false }),
    updatePreferences: vi.fn().mockResolvedValue({ showExplicitContent: true }),
    getSessions: vi.fn().mockResolvedValue([currentSession]),
    revokeSession: vi.fn().mockResolvedValue(null),
    updateProfile: vi.fn(),
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    ...overrides,
  };
}

function renderSettings(api = makeApi()) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <SettingsPage api={api} />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe("SettingsPage", () => {
  it("requires confirmation before opting in and persists the choice", async () => {
    const user = userEvent.setup();
    const api = makeApi();
    renderSettings(api);

    const toggle = await screen.findByRole("switch", {
      name: "Show explicit content",
    });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await user.click(toggle);
    expect(api.updatePreferences).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "Show explicit content?" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Yes, show explicit content" })
    );

    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"));
    expect(api.updatePreferences).toHaveBeenCalledWith({
      showExplicitContent: true,
    });
  });

  it("allows explicit content to be hidden immediately", async () => {
    const user = userEvent.setup();
    const api = makeApi({
      getPreferences: vi.fn().mockResolvedValue({ showExplicitContent: true }),
      updatePreferences: vi
        .fn()
        .mockResolvedValue({ showExplicitContent: false }),
    });
    renderSettings(api);

    const toggle = await screen.findByRole("switch", {
      name: "Show explicit content",
    });
    await user.click(toggle);

    await waitFor(() =>
      expect(toggle).toHaveAttribute("aria-checked", "false")
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the previous value when saving fails", async () => {
    const user = userEvent.setup();
    const api = makeApi({
      getPreferences: vi.fn().mockResolvedValue({ showExplicitContent: true }),
      updatePreferences: vi.fn().mockRejectedValue(new Error("offline")),
    });
    renderSettings(api);

    const toggle = await screen.findByRole("switch", {
      name: "Show explicit content",
    });
    await user.click(toggle);

    expect(
      await screen.findByText(
        "We couldn't save this preference. Please try again."
      )
    ).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("updates the display name and authenticated user", async () => {
    const user = userEvent.setup();
    const nextUser = { ...auth.user, displayName: "New Name" };
    const api = makeApi({
      updateProfile: vi.fn().mockResolvedValue(nextUser),
    });
    renderSettings(api);

    const input = screen.getByRole("textbox", { name: "Display name" });
    await user.clear(input);
    await user.type(input, "New Name");
    await user.click(screen.getByRole("button", { name: "Save display name" }));

    await screen.findByText("Display name updated.");
    expect(api.updateProfile).toHaveBeenCalledWith({ displayName: "New Name" });
    expect(auth.updateUser).toHaveBeenCalledWith(nextUser);
  });

  it("changes email with the current password and requests reverification", async () => {
    const user = userEvent.setup();
    const nextUser = {
      ...auth.user,
      email: "new@pumdoki.example",
      emailVerified: false,
    };
    const api = makeApi({
      changeEmail: vi.fn().mockResolvedValue(nextUser),
    });
    renderSettings(api);

    const section = screen
      .getByRole("heading", { name: "Account details" })
      .closest("section");
    const account = within(section);
    const emailInput = account.getByRole("textbox", { name: "New email" });
    await user.clear(emailInput);
    await user.type(emailInput, nextUser.email);
    await user.type(account.getByLabelText("Current password"), "old-password");
    await user.click(account.getByRole("button", { name: "Change email" }));

    await account.findByText(/Open the new verification message in Mailpit/);
    expect(api.changeEmail).toHaveBeenCalledWith({
      email: nextUser.email,
      currentPassword: "old-password",
    });
    expect(auth.updateUser).toHaveBeenCalledWith(nextUser);
  });

  it("validates matching passwords before changing the password", async () => {
    const user = userEvent.setup();
    const api = makeApi({
      changePassword: vi.fn().mockResolvedValue({ status: "changed" }),
    });
    renderSettings(api);

    const section = screen
      .getByRole("heading", { name: "Password" })
      .closest("section");
    const password = within(section);
    await user.type(
      password.getByLabelText("Current password"),
      "old-password"
    );
    await user.type(password.getByLabelText("New password"), "new-password-1");
    await user.type(
      password.getByLabelText("Confirm new password"),
      "new-password-2"
    );
    await user.click(password.getByRole("button", { name: "Change password" }));

    expect(await password.findByRole("alert")).toHaveTextContent(
      "New passwords do not match."
    );
    expect(api.changePassword).not.toHaveBeenCalled();
  });

  it("lists sessions and revokes a different browser", async () => {
    const user = userEvent.setup();
    const otherSession = {
      ...currentSession,
      id: "0de6895d-a055-46ba-9548-9d8bc96e8c10",
      userAgent: "Edg/140",
      current: false,
    };
    const api = makeApi({
      getSessions: vi.fn().mockResolvedValue([currentSession, otherSession]),
    });
    renderSettings(api);

    expect(await screen.findByText("Current session")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Revoke Microsoft Edge session" })
    );

    await waitFor(() =>
      expect(screen.queryByText("Microsoft Edge")).not.toBeInTheDocument()
    );
    expect(api.revokeSession).toHaveBeenCalledWith(otherSession.id);
  });
});
