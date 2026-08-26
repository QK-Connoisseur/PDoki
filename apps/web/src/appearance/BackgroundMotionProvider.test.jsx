import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BackgroundMotionProvider from "./BackgroundMotionProvider";
import {
  BACKGROUND_MOTION_STORAGE_KEY,
  useBackgroundMotion,
} from "./backgroundMotionContext";

function installMotionPreference(initiallyReduced = false) {
  let matches = initiallyReduced;
  const listeners = new Set();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    addEventListener: vi.fn((eventName, listener) => {
      if (eventName === "change") listeners.add(listener);
    }),
    removeEventListener: vi.fn((eventName, listener) => {
      if (eventName === "change") listeners.delete(listener);
    }),
  };

  window.matchMedia = vi.fn().mockReturnValue(mediaQuery);

  return {
    setReducedMotion(nextValue) {
      matches = nextValue;
      listeners.forEach((listener) => listener({ matches }));
    },
  };
}

function PreferenceProbe() {
  const { motionRequested, motionEnabled, setMotionRequested } =
    useBackgroundMotion();

  return (
    <>
      <output data-testid="motion-requested">
        {motionRequested ? "on" : "off"}
      </output>
      <output data-testid="motion-enabled">
        {motionEnabled ? "on" : "off"}
      </output>
      <button
        type="button"
        onClick={() => setMotionRequested(!motionRequested)}
      >
        Toggle motion
      </button>
    </>
  );
}

function renderPreference() {
  return render(
    <BackgroundMotionProvider>
      <PreferenceProbe />
    </BackgroundMotionProvider>
  );
}

beforeEach(() => {
  const values = new Map();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
    clear: vi.fn(() => values.clear()),
  });
  installMotionPreference(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BackgroundMotionProvider", () => {
  it("enables ambient motion by default and persists a browser-local opt-out", async () => {
    const user = userEvent.setup();
    renderPreference();

    expect(screen.getByTestId("motion-requested")).toHaveTextContent("on");
    expect(screen.getByTestId("motion-enabled")).toHaveTextContent("on");

    await user.click(screen.getByRole("button", { name: "Toggle motion" }));

    expect(screen.getByTestId("motion-requested")).toHaveTextContent("off");
    expect(screen.getByTestId("motion-enabled")).toHaveTextContent("off");
    expect(window.localStorage.getItem(BACKGROUND_MOTION_STORAGE_KEY)).toBe(
      "off"
    );
  });

  it("restores a saved opt-out before rendering motion", () => {
    window.localStorage.setItem(BACKGROUND_MOTION_STORAGE_KEY, "off");
    renderPreference();

    expect(screen.getByTestId("motion-requested")).toHaveTextContent("off");
    expect(screen.getByTestId("motion-enabled")).toHaveTextContent("off");
  });

  it("responds when the device reduced-motion preference changes", () => {
    const devicePreference = installMotionPreference(true);
    renderPreference();

    expect(screen.getByTestId("motion-requested")).toHaveTextContent("on");
    expect(screen.getByTestId("motion-enabled")).toHaveTextContent("off");

    act(() => devicePreference.setReducedMotion(false));

    expect(screen.getByTestId("motion-enabled")).toHaveTextContent("on");
  });
});
