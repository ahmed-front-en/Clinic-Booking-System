"use client";

import { useState } from "react";
import { useAuth } from "./use-auth";
import { useApiError } from "@/hooks/useApiError";

export function useRegister() {
  const { register } = useAuth();
  const { parse } = useApiError();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(email: string, password: string, fullName: string) {
    setIsPending(true);
    setError(null);
    try {
      await register(email, password, fullName);
    } catch (err: unknown) {
      setError(parse(err).message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  return { submit, isPending, error };
}
