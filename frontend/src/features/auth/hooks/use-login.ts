"use client";

import { useState } from "react";
import { useAuth } from "./use-auth";

export function useLogin() {
  const { login } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(email: string, password: string) {
    setIsPending(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  return { submit, isPending, error };
}
