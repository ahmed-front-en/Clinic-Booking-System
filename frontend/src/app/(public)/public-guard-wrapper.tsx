"use client";

import type { ReactNode } from "react";
import { PublicGuard } from "@/components/guards/public-guard";

export function PublicGuardWrapper({ children }: { children: ReactNode }) {
  return <PublicGuard>{children}</PublicGuard>;
}
