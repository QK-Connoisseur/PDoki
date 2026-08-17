import { useCallback, useEffect, useMemo, useState } from "react";
import { AppearanceContext } from "./appearanceContext";

export const SAKURA_MOTION_STORAGE_KEY = "pumdoki_background_motion_v1";

function readStoredMotionPreference(storage) {
  if (!storage) return true;
  try {
    return storage.getItem(SAKURA_MOTION_STORAGE_KEY) !== "disabled";
  } catch {
    return true;
  }
}

function getDefaultStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getMotionQuery() {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  return window.matchMedia("(prefers-reduced-motion: reduce)");
}

function getSaveData() {
  if (typeof navigator === "undefined") return false;
  return Boolean(navigator.connection?.saveData);
}

function getVisibility() {
  return (
    typeof document === "undefined" || document.visibilityState !== "hidden"
  );
}

export function AppearanceProvider({
  children,
  storage = getDefaultStorage(),
}) {
  const [backgroundMotionEnabled, setBackgroundMotionEnabledState] = useState(
    () => readStoredMotionPreference(storage)
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => getMotionQuery()?.matches ?? false
  );
  const [saveData, setSaveData] = useState(getSaveData);
  const [documentVisible, setDocumentVisible] = useState(getVisibility);

  useEffect(() => {
    const query = getMotionQuery();
    if (!query) return undefined;

    const handleChange = (event) => setPrefersReducedMotion(event.matches);
    setPrefersReducedMotion(query.matches);
    if (query.addEventListener) query.addEventListener("change", handleChange);
    else query.addListener?.(handleChange);

    return () => {
      if (query.removeEventListener) {
        query.removeEventListener("change", handleChange);
      } else {
        query.removeListener?.(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const handleVisibility = () => setDocumentVisible(getVisibility());
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const connection =
      typeof navigator === "undefined" ? null : navigator.connection;
    if (!connection?.addEventListener) return undefined;
    const handleConnectionChange = () =>
      setSaveData(Boolean(connection.saveData));
    connection.addEventListener("change", handleConnectionChange);
    return () =>
      connection.removeEventListener("change", handleConnectionChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleStorage = (event) => {
      if (event.key !== SAKURA_MOTION_STORAGE_KEY) return;
      setBackgroundMotionEnabledState(event.newValue !== "disabled");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setBackgroundMotionEnabled = useCallback(
    (enabled) => {
      const nextValue = Boolean(enabled);
      setBackgroundMotionEnabledState(nextValue);
      try {
        storage?.setItem(
          SAKURA_MOTION_STORAGE_KEY,
          nextValue ? "enabled" : "disabled"
        );
      } catch {
        // The setting still applies for this tab when storage is unavailable.
      }
    },
    [storage]
  );

  const backgroundMotionActive =
    backgroundMotionEnabled &&
    !prefersReducedMotion &&
    !saveData &&
    documentVisible;

  const value = useMemo(
    () => ({
      backgroundMotionEnabled,
      setBackgroundMotionEnabled,
      backgroundMotionActive,
      prefersReducedMotion,
      saveData,
    }),
    [
      backgroundMotionEnabled,
      setBackgroundMotionEnabled,
      backgroundMotionActive,
      prefersReducedMotion,
      saveData,
    ]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}
