import type { ReactNode } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PublicGuardWrapper } from "./public-guard-wrapper";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <PublicGuardWrapper>
      <AuthLayout>{children}</AuthLayout>
    </PublicGuardWrapper>
  );
}
