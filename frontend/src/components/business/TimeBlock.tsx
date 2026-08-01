"use client";

import { Clock } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

interface TimeBlockProps {
  startTime: string;
  endTime: string;
  className?: string;
}

export function TimeBlock({ startTime, endTime, className }: TimeBlockProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary",
        className,
      )}
    >
      <Clock className="size-4 shrink-0" aria-hidden="true" />
      <span>
        {formatTime(startTime)} – {formatTime(endTime)}
      </span>
    </div>
  );
}
