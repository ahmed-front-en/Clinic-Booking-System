"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/components/guards/auth-guard";

export function AuthGuardWrapper({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
