import { render, screen, waitFor } from "@testing-library/react";
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
};

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

function renderSettings(api) {
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
    const api = {
      getPreferences: vi.fn().mockResolvedValue({ showExplicitContent: false }),
      updatePreferences: vi
        .fn()
        .mockResolvedValue({ showExplicitContent: true }),
    };
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
    const api = {
      getPreferences: vi.fn().mockResolvedValue({ showExplicitContent: true }),
      updatePreferences: vi
        .fn()
        .mockResolvedValue({ showExplicitContent: false }),
    };
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
    const api = {
      getPreferences: vi.fn().mockResolvedValue({ showExplicitContent: true }),
      updatePreferences: vi.fn().mockRejectedValue(new Error("offline")),
    };
    renderSettings(api);

    const toggle = await screen.findByRole("switch", {
      name: "Show explicit content",
    });
    await user.click(toggle);

    expect(
      await screen.findByText(
        "We couldn’t save this preference. Please try again."
      )
    ).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
