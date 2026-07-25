"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: Record<string, FormDataEntryValue>) => Promise<void>;
  children: ReactNode;
  submitLabel?: string;
}

export function FormModal({
  open,
  onClose,
  title,
  onSubmit,
  children,
  submitLabel = "Save",
}: FormModalProps) {
  const [isPending, setIsPending] = useState(false);
  const titleId = "form-modal-title";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);
      const values = Object.fromEntries(data.entries());
      await onSubmit(values);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} titleId={titleId}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-4">
          <h3 id={titleId} className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
