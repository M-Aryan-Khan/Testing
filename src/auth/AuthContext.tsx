import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { AuthResponse } from "../types";

interface AuthContextValue {
  token: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("healthpulse_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("healthpulse_username"));

  const saveAuth = (result: AuthResponse) => {
    localStorage.setItem("healthpulse_token", result.access_token);
    localStorage.setItem("healthpulse_username", result.username);
    setToken(result.access_token);
    setUsername(result.username);
  };

  const login = async (name: string, password: string) => {
    saveAuth(await api<AuthResponse>("/v1/auth/login", { method: "POST", body: { username: name, password }, auth: false }));
  };

  const signup = async (name: string, password: string) => {
    saveAuth(await api<AuthResponse>("/v1/auth/signup", { method: "POST", body: { username: name, password }, auth: false }));
  };

  const logout = () => {
    localStorage.removeItem("healthpulse_token");
    localStorage.removeItem("healthpulse_username");
    setToken(null);
    setUsername(null);
  };

  const value = useMemo(() => ({ token, username, login, signup, logout }), [token, username]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
