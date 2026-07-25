import type { ReactNode } from "react";
import { AuthGuardWrapper } from "./auth-guard-wrapper";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <AuthGuardWrapper>{children}</AuthGuardWrapper>;
}
