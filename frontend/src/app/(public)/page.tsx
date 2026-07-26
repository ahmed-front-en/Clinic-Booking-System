import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/business/HeroSection";

export const metadata: Metadata = {
  title: "HealthFlow — Your health journey, simplified",
  description:
    "Book appointments with top doctors, manage your schedule, and take control of your healthcare — all in one place.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface-container-low px-6">
        <Link href="/" className="text-lg font-bold text-primary">
          HealthFlow
        </Link>
      </header>
      <main className="flex flex-1 flex-col">
        <HeroSection />
      </main>
    </div>
  );
}
