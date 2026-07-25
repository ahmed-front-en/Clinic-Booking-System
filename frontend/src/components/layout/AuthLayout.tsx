import type { ReactNode } from "react";
import Link from "next/link";
import { Footer } from "./Footer";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-14 items-center border-b border-border px-6">
        <Link href="/" className="text-lg font-bold text-primary">
          HealthFlow
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
