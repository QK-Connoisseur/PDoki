import { useCallback, useEffect, useMemo, useState } from "react";
import { subscribeToUnauthorized } from "../lib/apiClient";
import { authApi as defaultAuthApi } from "./authApi";
import { AuthContext } from "./authContext";

export function AuthProvider({ children, api = defaultAuthApi }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);

  const becomeUnauthenticated = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    try {
      const nextUser = await api.getMe();
      setUser(nextUser);
      setStatus("authenticated");
      return nextUser;
    } catch (error) {
      if (error?.status === 401) {
        becomeUnauthenticated();
        return null;
      }
      setUser(null);
      setStatus("unavailable");
      throw error;
    }
  }, [api, becomeUnauthenticated]);

  useEffect(() => {
    void refreshSession().catch(() => {});
  }, [refreshSession]);

  useEffect(
    () => subscribeToUnauthorized(becomeUnauthenticated),
    [becomeUnauthenticated]
  );

  const login = useCallback(
    async (input) => {
      const nextUser = await api.login(input);
      setUser(nextUser);
      setStatus("authenticated");
      return nextUser;
    },
    [api]
  );

  const register = useCallback(
    async (input) => {
      const nextUser = await api.register(input);
      setUser(nextUser);
      setStatus("authenticated");
      return nextUser;
    },
    [api]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      if (error?.status !== 401) throw error;
    }
    becomeUnauthenticated();
  }, [api, becomeUnauthenticated]);

  const logoutAll = useCallback(async () => {
    try {
      await api.logoutAll();
    } catch (error) {
      if (error?.status !== 401) throw error;
    }
    becomeUnauthenticated();
  }, [api, becomeUnauthenticated]);

  const requestVerification = useCallback(async () => {
    try {
      return await api.requestVerification();
    } catch (error) {
      if (error?.status === 401) becomeUnauthenticated();
      throw error;
    }
  }, [api, becomeUnauthenticated]);

  const confirmVerification = useCallback(
    async (token) => {
      const verifiedUser = await api.confirmVerification(token);
      setUser((currentUser) => (currentUser ? verifiedUser : null));
      return verifiedUser;
    },
    [api]
  );

  const requestPasswordReset = useCallback(
    (email) => api.requestPasswordReset(email),
    [api]
  );

  const confirmPasswordReset = useCallback(
    async (token, password) => {
      await api.confirmPasswordReset(token, password);
      becomeUnauthenticated();
    },
    [api, becomeUnauthenticated]
  );

  const updateUser = useCallback((nextUser) => {
    setUser((currentUser) => (currentUser ? nextUser : null));
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      register,
      logout,
      logoutAll,
      refreshSession,
      requestVerification,
      confirmVerification,
      requestPasswordReset,
      confirmPasswordReset,
      updateUser,
    }),
    [
      status,
      user,
      login,
      register,
      logout,
      logoutAll,
      refreshSession,
      requestVerification,
      confirmVerification,
      requestPasswordReset,
      confirmPasswordReset,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
