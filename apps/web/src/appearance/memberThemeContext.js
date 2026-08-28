import { createContext, useContext } from "react";

export const MEMBER_THEME_STORAGE_KEY = "pumdoki:member-theme:v1";

export const MEMBER_THEMES = Object.freeze({
  SAKURA: "sakura",
  DARK_KNIGHT: "dark-knight",
});

export const DEFAULT_MEMBER_THEME = MEMBER_THEMES.SAKURA;

export function isMemberTheme(value) {
  return Object.values(MEMBER_THEMES).includes(value);
}

export const MemberThemeContext = createContext(null);

export function useOptionalMemberTheme() {
  return useContext(MemberThemeContext);
}

export function useMemberTheme() {
  const value = useOptionalMemberTheme();
  if (!value) {
    throw new Error("useMemberTheme must be used inside MemberThemeProvider");
  }
  return value;
}
