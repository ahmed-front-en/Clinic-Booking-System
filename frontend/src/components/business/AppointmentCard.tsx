"use client";

import { Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/business/StatusBadge";
import { ConfirmDialog } from "@/components/business/ConfirmDialog";
import { useState, memo } from "react";
import { formatDateTime } from "@/lib/utils";
import type { AppointmentReadModel } from "@/types/models/appointment";
import type { UserRole } from "@/types/enums";

interface AppointmentCardProps {
  appointment: AppointmentReadModel;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
  viewer?: UserRole;
}

const CANCELLABLE_STATUSES = new Set(["scheduled", "confirmed"]);

export const AppointmentCard = memo(function AppointmentCard({
  appointment,
  onCancel,
  isCancelling,
  viewer = "patient",
}: AppointmentCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancellable =
    onCancel && CANCELLABLE_STATUSES.has(appointment.status);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-outline-variant sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Stethoscope className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">
            {viewer === "doctor"
              ? appointment.patient.fullName
              : appointment.doctor.displayName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {appointment.doctor.specialtyName}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-foreground">
            {formatDateTime(appointment.slot.date, appointment.slot.startTime)}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
        {cancellable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={isCancelling}
          >
            <X className="size-3.5" />
            Cancel
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (onCancel) onCancel(appointment.id);
          setConfirmOpen(false);
        }}
        title="Cancel appointment?"
        message="This appointment will be cancelled and can no longer be attended."
        confirmLabel="Cancel appointment"
        isLoading={isCancelling}
      />
    </div>
  );
});
