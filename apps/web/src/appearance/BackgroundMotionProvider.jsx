import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BACKGROUND_MOTION_STORAGE_KEY,
  BackgroundMotionContext,
  REDUCED_MOTION_MEDIA_QUERY,
} from "./backgroundMotionContext";

function readStoredPreference() {
  if (typeof window === "undefined") return true;

  try {
    return window.localStorage.getItem(BACKGROUND_MOTION_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function readSystemPreference() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
}

export default function BackgroundMotionProvider({ children }) {
  const [motionRequested, setMotionRequested] = useState(readStoredPreference);
  const [systemReducedMotion, setSystemReducedMotion] =
    useState(readSystemPreference);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const motionQuery = window.matchMedia?.(REDUCED_MOTION_MEDIA_QUERY);
    const handleSystemPreference = (event) => {
      setSystemReducedMotion(event.matches);
    };
    const handleStorage = (event) => {
      if (event.key === BACKGROUND_MOTION_STORAGE_KEY || event.key === null) {
        setMotionRequested(readStoredPreference());
      }
    };

    if (motionQuery?.addEventListener) {
      motionQuery.addEventListener("change", handleSystemPreference);
    } else {
      motionQuery?.addListener?.(handleSystemPreference);
    }
    window.addEventListener("storage", handleStorage);

    return () => {
      if (motionQuery?.removeEventListener) {
        motionQuery.removeEventListener("change", handleSystemPreference);
      } else {
        motionQuery?.removeListener?.(handleSystemPreference);
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateMotionRequested = useCallback((enabled) => {
    const nextValue = Boolean(enabled);
    setMotionRequested(nextValue);

    try {
      window.localStorage.setItem(
        BACKGROUND_MOTION_STORAGE_KEY,
        nextValue ? "on" : "off"
      );
    } catch {
      // The setting still applies for this visit when storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({
      motionRequested,
      motionEnabled: motionRequested && !systemReducedMotion,
      systemReducedMotion,
      setMotionRequested: updateMotionRequested,
    }),
    [motionRequested, systemReducedMotion, updateMotionRequested]
  );

  return (
    <BackgroundMotionContext.Provider value={value}>
      {children}
    </BackgroundMotionContext.Provider>
  );
}
