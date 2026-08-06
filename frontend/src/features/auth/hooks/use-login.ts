"use client";

import { useState } from "react";
import { useAuth } from "./use-auth";
import { useApiError } from "@/hooks/useApiError";

export function useLogin() {
  const { login } = useAuth();
  const { parse } = useApiError();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(email: string, password: string) {
    setIsPending(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(parse(err).message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  return { submit, isPending, error };
}
