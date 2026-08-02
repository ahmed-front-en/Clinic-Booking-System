"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import type { Column, DataTableProps } from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { StatusBadge } from "@/components/business/StatusBadge";
import { Button } from "@/components/ui/button";

const DataTable = dynamic(
  () => import("@/components/data/DataTable").then((mod) => mod.DataTable),
  { loading: () => <Skeleton variant="table" /> },
) as <T extends object>(props: DataTableProps<T>) => React.JSX.Element;

const AppointmentDetailModal = dynamic(
  () => import("@/components/business/AppointmentDetailModal").then((mod) => mod.AppointmentDetailModal),
  { loading: () => <Skeleton variant="form" /> },
);

const ConfirmDialog = dynamic(
  () => import("@/components/business/ConfirmDialog").then((mod) => mod.ConfirmDialog),
  { loading: () => <Skeleton variant="form" /> },
);
import {
  useAppointmentsAdmin,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/features/appointments";
import { PAGINATION_DEFAULTS } from "@/config";
import type { AppointmentRecord } from "@/types/models/appointment";
import type { UpdateAppointmentInput } from "@/schemas/appointment";

const truncate = (value: string, length = 10) =>
  value.length > length ? `${value.slice(0, length)}…` : value;

export default function AdminAppointmentsPage() {
  const [page, setPage] = useState<number>(PAGINATION_DEFAULTS.page);
  const { data, isPending, isError, refetch } = useAppointmentsAdmin({
    page,
    limit: PAGINATION_DEFAULTS.limit,
  });
  const { mutate: updateAppointment, isPending: isUpdating } = useUpdateAppointment();
  const { mutate: deleteAppointment, isPending: isDeleting } = useDeleteAppointment();

  const [editing, setEditing] = useState<AppointmentRecord | null>(null);
  const [deleting, setDeleting] = useState<AppointmentRecord | null>(null);

  const appointments = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const columns: Column<AppointmentRecord>[] = [
    {
      key: "patientId",
      header: "Patient",
      render: (appointment) => truncate(appointment.patientId),
    },
    {
      key: "slotId",
      header: "Slot",
      render: (appointment) => truncate(appointment.slotId),
    },
    {
      key: "status",
      header: "Status",
      render: (appointment) => <StatusBadge status={appointment.status} />,
    },
    {
      key: "notes",
      header: "Notes",
      render: (appointment) =>
        appointment.notes ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (appointment) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(appointment)}
            aria-label={`Edit appointment ${truncate(appointment.id)}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(appointment)}
            aria-label={`Delete appointment ${truncate(appointment.id)}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Appointments
        </h1>
        <p className="text-lg text-muted-foreground">
          Review and update all appointments across the platform.
        </p>
      </header>

      {isError ? (
        <ErrorBanner message="Could not load appointments." onRetry={refetch} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={appointments}
            loading={isPending}
            sortable
            emptyState={
              <EmptyState
                icon={<Calendar className="size-12" />}
                title="No appointments"
                description="Appointments booked by patients will appear here."
              />
            }
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {editing && (
        <AppointmentDetailModal
          open
          onClose={() => setEditing(null)}
          appointment={editing}
          isSubmitting={isUpdating}
          onSubmit={(data: UpdateAppointmentInput) => {
            updateAppointment(
              { id: editing.id, data },
              { onSuccess: () => setEditing(null) },
            );
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          open
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            deleteAppointment(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete appointment"
          message={`Delete appointment ${truncate(deleting.id)}? Deleting fails if a payment record exists for it.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
