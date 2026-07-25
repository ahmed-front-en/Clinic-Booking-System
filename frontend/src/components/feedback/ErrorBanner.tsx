"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onRetry, className }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3",
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
      <p className="flex-1 text-sm text-foreground">{message}</p>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <Button variant="outline" size="xs" onClick={onRetry}>
            Try again
          </Button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
