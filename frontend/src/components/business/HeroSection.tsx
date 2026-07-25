import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-4 text-center",
        className,
      )}
    >
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Your health journey, simplified
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
        Book appointments with top doctors, manage your schedule, and take
        control of your healthcare — all in one place.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link href="/register">
          <Button size="lg">Get started</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">
            Sign in
          </Button>
        </Link>
      </div>
    </section>
  );
}
