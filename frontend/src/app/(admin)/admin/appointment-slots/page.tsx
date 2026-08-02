"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarRange, Pencil, Plus, Trash2 } from "lucide-react";
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

const SlotFormModal = dynamic(
  () => import("@/components/business/SlotFormModal").then((mod) => mod.SlotFormModal),
  { loading: () => <Skeleton variant="form" /> },
);

const ConfirmDialog = dynamic(
  () => import("@/components/business/ConfirmDialog").then((mod) => mod.ConfirmDialog),
  { loading: () => <Skeleton variant="form" /> },
);
import {
  useSlotsAdmin,
  useCreateSlot,
  useUpdateSlot,
  useDeleteSlot,
} from "@/features/slots";
import { useDoctorsList } from "@/features/doctors";
import { useSchedulesAdmin } from "@/features/schedules";
import { formatTime } from "@/lib/utils";
import { PAGINATION_DEFAULTS } from "@/config";
import type { AppointmentSlotRecord } from "@/types/models/slot";
import type {
  CreateAppointmentSlotInput,
  UpdateAppointmentSlotInput,
} from "@/schemas/slot";

export default function AdminAppointmentSlotsPage() {
  const [page, setPage] = useState<number>(PAGINATION_DEFAULTS.page);
  const { data, isPending, isError, refetch } = useSlotsAdmin({
    page,
    limit: PAGINATION_DEFAULTS.limit,
  });
  const { data: doctors } = useDoctorsList();
  const { data: schedulesData } = useSchedulesAdmin({ page: 1, limit: 100 });

  const { mutate: createSlot, isPending: isCreating } = useCreateSlot();
  const { mutate: updateSlot, isPending: isUpdating } = useUpdateSlot();
  const { mutate: deleteSlot, isPending: isDeleting } = useDeleteSlot();

  const [editing, setEditing] = useState<AppointmentSlotRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AppointmentSlotRecord | null>(null);

  const slots = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const schedules = schedulesData?.data ?? [];

  const doctorLabel = useCallback(
    (id: string) =>
      doctors?.find((doctor) => doctor.id === id)?.id.slice(0, 8) ?? id.slice(0, 8),
    [doctors],
  );

  const columns: Column<AppointmentSlotRecord>[] = useMemo(() => [
    { key: "doctorId", header: "Doctor", render: (slot) => `Doctor ${doctorLabel(slot.doctorId)}` },
    { key: "slotDate", header: "Date", sortable: true },
    {
      key: "startTime",
      header: "Time",
      render: (slot) => `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (slot) => <StatusBadge status={slot.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (slot) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(slot)}
            aria-label={`Edit slot ${slot.slotDate}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(slot)}
            aria-label={`Delete slot ${slot.slotDate}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [doctorLabel]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Appointment Slots
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage bookable appointment slots.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Add slot
        </Button>
      </header>

      {isError ? (
        <ErrorBanner message="Could not load appointment slots." onRetry={refetch} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={slots}
            loading={isPending}
            sortable
            emptyState={
              <EmptyState
                icon={<CalendarRange className="size-12" />}
                title="No slots yet"
                description="Create appointment slots for doctors to fill their schedule."
              />
            }
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {creating && (
        <SlotFormModal
          open
          onClose={() => setCreating(false)}
          doctors={doctors ?? []}
          schedules={schedules}
          isSubmitting={isCreating}
          onSubmit={(data) => {
            createSlot(data as CreateAppointmentSlotInput, {
              onSuccess: () => setCreating(false),
            });
          }}
        />
      )}

      {editing && (
        <SlotFormModal
          open
          onClose={() => setEditing(null)}
          slot={editing}
          doctors={doctors ?? []}
          schedules={schedules}
          isSubmitting={isUpdating}
          onSubmit={(data) => {
            updateSlot(
              { id: editing.id, data: data as UpdateAppointmentSlotInput },
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
            deleteSlot(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete slot"
          message={`Delete the appointment slot on ${deleting.slotDate}? The slot will be soft-deleted.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
