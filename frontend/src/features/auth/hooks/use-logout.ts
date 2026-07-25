"use client";

import { useState } from "react";
import { useAuth } from "./use-auth";

export function useLogout() {
  const { logout } = useAuth();
  const [isPending, setIsPending] = useState(false);

  async function submit() {
    setIsPending(true);
    try {
      await logout();
    } catch {
    } finally {
      setIsPending(false);
    }
  }

  return { submit, isPending };
}
