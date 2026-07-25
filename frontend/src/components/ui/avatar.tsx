"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  className?: string;
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt ?? fallback}
        width={32}
        height={32}
        className={cn("size-8 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground select-none",
        className,
      )}
      aria-label={alt ?? fallback}
    >
      {getInitials(fallback)}
    </div>
  );
}
