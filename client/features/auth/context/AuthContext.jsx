import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/features/common/lib/api";

const AuthContext = createContext(null);

/**
 * Holds the signed-in user. `status` is "loading" | "signed-in" | "signed-out"
 * | "unavailable" (server has no database, so accounts are disabled).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api("/auth/me")
      .then(({ user: current }) => {
        setUser(current);
        setStatus("signed-in");
      })
      .catch((error) =>
        setStatus(error.status === 503 ? "unavailable" : "signed-out"),
      );
  }, []);

  const signIn = useCallback((nextUser) => {
    setUser(nextUser);
    setStatus("signed-in");
  }, []);

  const login = useCallback(
    async (credentials) =>
      signIn(
        (await api("/auth/login", { method: "POST", body: credentials })).user,
      ),
    [signIn],
  );

  const register = useCallback(
    async (details) =>
      signIn(
        (await api("/auth/register", { method: "POST", body: details })).user,
      ),
    [signIn],
  );

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setStatus("signed-out");
  }, []);

  const updateProfile = useCallback(async (changes) => {
    const { user: updated } = await api("/auth/me", {
      method: "PATCH",
      body: changes,
    });
    setUser(updated);
  }, []);

  const changePassword = useCallback(
    (passwords) => api("/auth/password", { method: "PUT", body: passwords }),
    [],
  );

  const deleteAccount = useCallback(async (password) => {
    await api("/auth/me", { method: "DELETE", body: { password } });
    setUser(null);
    setStatus("signed-out");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      deleteAccount,
    }),
    [
      user,
      status,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      deleteAccount,
    ],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
