import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_MEMBER_THEME,
  isMemberTheme,
  MEMBER_THEME_STORAGE_KEY,
  MemberThemeContext,
} from "./memberThemeContext";

function readStoredTheme() {
  if (typeof window === "undefined") return DEFAULT_MEMBER_THEME;

  try {
    const storedTheme = window.localStorage.getItem(MEMBER_THEME_STORAGE_KEY);
    return isMemberTheme(storedTheme) ? storedTheme : DEFAULT_MEMBER_THEME;
  } catch {
    return DEFAULT_MEMBER_THEME;
  }
}

export default function MemberThemeProvider({ children }) {
  const [memberTheme, setMemberThemeState] = useState(readStoredTheme);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event) => {
      if (event.key === MEMBER_THEME_STORAGE_KEY || event.key === null) {
        setMemberThemeState(readStoredTheme());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setMemberTheme = useCallback((nextTheme) => {
    const resolvedTheme = isMemberTheme(nextTheme)
      ? nextTheme
      : DEFAULT_MEMBER_THEME;

    setMemberThemeState(resolvedTheme);

    try {
      window.localStorage.setItem(MEMBER_THEME_STORAGE_KEY, resolvedTheme);
    } catch {
      // The selection still applies for this visit when storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({ memberTheme, setMemberTheme }),
    [memberTheme, setMemberTheme]
  );

  return (
    <MemberThemeContext.Provider value={value}>
      {children}
    </MemberThemeContext.Provider>
  );
}
