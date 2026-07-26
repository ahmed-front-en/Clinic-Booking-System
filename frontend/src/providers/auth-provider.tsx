"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { UserRecord } from "@/types/models/user";
import * as authApi from "@/features/auth/api/auth.api";
import { setAccessToken, setRefreshToken, getRefreshToken, clearTokens } from "@/lib/token-store";
import { showToast } from "@/lib/toast-store";

export interface AuthContextValue {
  user: UserRecord | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(!!getRefreshToken());

  useEffect(() => {
    const storedRefresh = getRefreshToken();
    if (!storedRefresh) {
      return;
    }
    authApi
      .refreshUserTokens({ refreshToken: storedRefresh })
      .then((tokens) => {
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        return authApi.getCurrentUser();
      })
      .then(setUser)
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.loginUser({ email, password });
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    showToast("Logged in successfully", "success");
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const tokens = await authApi.registerUser({ email, password, fullName });
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    showToast("Account created successfully", "success");
  }, []);

  const logout = useCallback(async () => {
    const storedRefresh = getRefreshToken();
    try {
      if (storedRefresh) {
        await authApi.logoutUser({ refreshToken: storedRefresh });
      }
    } catch {
    } finally {
      clearTokens();
      setUser(null);
      showToast("Logged out", "info");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
