import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppearance } from "./appearanceContext";
import {
  AppearanceProvider,
  SAKURA_MOTION_STORAGE_KEY,
} from "./AppearanceProvider";

let mediaMatches = false;
let mediaListener;
let memoryStorage;

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, value)),
  };
}

function installMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    get matches() {
      return mediaMatches;
    },
    addEventListener: vi.fn((event, listener) => {
      if (event === "change") mediaListener = listener;
    }),
    removeEventListener: vi.fn(),
  }));
}

function AppearanceProbe() {
  const appearance = useAppearance();
  return (
    <div>
      <output data-testid="enabled">
        {String(appearance.backgroundMotionEnabled)}
      </output>
      <output data-testid="active">
        {String(appearance.backgroundMotionActive)}
      </output>
      <output data-testid="reduced">
        {String(appearance.prefersReducedMotion)}
      </output>
      <button
        type="button"
        onClick={() =>
          appearance.setBackgroundMotionEnabled(
            !appearance.backgroundMotionEnabled
          )
        }
      >
        Toggle motion
      </button>
    </div>
  );
}

function renderProvider(props = {}) {
  return render(
    <AppearanceProvider storage={memoryStorage} {...props}>
      <AppearanceProbe />
    </AppearanceProvider>
  );
}

beforeEach(() => {
  mediaMatches = false;
  mediaListener = undefined;
  memoryStorage = createMemoryStorage();
  installMatchMedia();
});

describe("AppearanceProvider", () => {
  it("enables gentle motion by default and persists an explicit opt-out", async () => {
    const user = userEvent.setup();
    const first = renderProvider();

    expect(screen.getByTestId("enabled")).toHaveTextContent("true");
    expect(screen.getByTestId("active")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "Toggle motion" }));
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
    expect(memoryStorage.getItem(SAKURA_MOTION_STORAGE_KEY)).toBe("disabled");

    first.unmount();
    renderProvider();
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
    expect(screen.getByTestId("active")).toHaveTextContent("false");
  });

  it("lets the operating system pause motion without changing the user choice", () => {
    renderProvider();

    act(() => {
      mediaMatches = true;
      mediaListener({ matches: true });
    });

    expect(screen.getByTestId("enabled")).toHaveTextContent("true");
    expect(screen.getByTestId("reduced")).toHaveTextContent("true");
    expect(screen.getByTestId("active")).toHaveTextContent("false");
  });

  it("keeps working when device storage is unavailable", async () => {
    const user = userEvent.setup();
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("storage blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("storage blocked");
      }),
    };
    renderProvider({ storage });

    expect(screen.getByTestId("enabled")).toHaveTextContent("true");
    await user.click(screen.getByRole("button", { name: "Toggle motion" }));
    expect(screen.getByTestId("enabled")).toHaveTextContent("false");
  });
});
