import type { ReactNode } from "react";
import { AdminGuardWrapper } from "./admin-guard-wrapper";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGuardWrapper>{children}</AdminGuardWrapper>;
}
