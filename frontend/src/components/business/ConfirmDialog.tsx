"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: "danger" | "success";
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
  confirmLabel,
  isLoading,
}: ConfirmDialogProps) {
  const Icon = variant === "danger" ? AlertTriangle : CheckCircle;
  const iconColor = variant === "danger" ? "text-destructive" : "text-success";
  const titleId = "confirm-dialog-title";

  return (
    <Dialog open={open} onClose={onClose} titleId={titleId}>
      <div className="flex flex-col items-center gap-4 text-center">
        <Icon className={iconColor} aria-hidden="true" />
        <h3 id={titleId} className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="mt-2 flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : confirmLabel ?? (variant === "danger" ? "Delete" : "Confirm")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
