import type { ReactNode } from "react";
import { PublicGuardWrapper } from "./public-guard-wrapper";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicGuardWrapper>{children}</PublicGuardWrapper>;
}
