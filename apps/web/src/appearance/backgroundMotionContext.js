import { createContext, useContext } from "react";

export const BACKGROUND_MOTION_STORAGE_KEY =
  "pumdoki:sakura-background-motion:v1";

export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

export const BackgroundMotionContext = createContext(null);

export function useOptionalBackgroundMotion() {
  return useContext(BackgroundMotionContext);
}

export function useBackgroundMotion() {
  const value = useOptionalBackgroundMotion();
  if (!value) {
    throw new Error(
      "useBackgroundMotion must be used inside BackgroundMotionProvider"
    );
  }
  return value;
}
