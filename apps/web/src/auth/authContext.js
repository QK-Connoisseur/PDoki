import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function useOptionalAuth() {
  return useContext(AuthContext);
}

export function useAuth() {
  const value = useOptionalAuth();
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
