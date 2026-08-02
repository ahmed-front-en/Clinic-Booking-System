"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import type { Column, DataTableProps } from "@/components/data/DataTable";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Button } from "@/components/ui/button";

const DataTable = dynamic(
  () => import("@/components/data/DataTable").then((mod) => mod.DataTable),
  { loading: () => <Skeleton variant="table" /> },
) as <T extends object>(props: DataTableProps<T>) => React.JSX.Element;

const WeeklyCalendar = dynamic(
  () => import("@/components/business/WeeklyCalendar").then((mod) => mod.WeeklyCalendar),
  { loading: () => <Skeleton variant="calendar" /> },
);

const ScheduleFormModal = dynamic(
  () => import("@/components/business/ScheduleFormModal").then((mod) => mod.ScheduleFormModal),
  { loading: () => <Skeleton variant="form" /> },
);

const ConfirmDialog = dynamic(
  () => import("@/components/business/ConfirmDialog").then((mod) => mod.ConfirmDialog),
  { loading: () => <Skeleton variant="form" /> },
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  useSchedulesAdmin,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/features/schedules";
import { useDoctorsList } from "@/features/doctors";
import { formatTime } from "@/lib/utils";
import type { DoctorScheduleRecord } from "@/types/models/schedule";
import type {
  CreateDoctorScheduleInput,
  UpdateDoctorScheduleInput,
} from "@/schemas/schedule";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminDoctorSchedulesPage() {
  const {
    data: schedulesData,
    isPending,
    isError,
    refetch,
  } = useSchedulesAdmin({ page: 1, limit: 100 });
  const { data: doctors } = useDoctorsList();

  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateSchedule();
  const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule();

  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [editing, setEditing] = useState<DoctorScheduleRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<DoctorScheduleRecord | null>(null);

  const schedules = schedulesData?.data ?? [];
  const doctorSchedules = selectedDoctor
    ? schedules.filter((schedule) => schedule.doctorId === selectedDoctor)
    : schedules;

  const doctorLabel = (id: string) =>
    doctors?.find((doctor) => doctor.id === id)?.id.slice(0, 8) ?? id.slice(0, 8);

  const columns: Column<DoctorScheduleRecord>[] = [
    {
      key: "weekday",
      header: "Day",
      render: (schedule) => DAYS[schedule.weekday],
    },
    {
      key: "startTime",
      header: "Start",
      render: (schedule) => formatTime(schedule.startTime),
    },
    {
      key: "endTime",
      header: "End",
      render: (schedule) => formatTime(schedule.endTime),
    },
    {
      key: "slotDuration",
      header: "Slot duration",
      render: (schedule) => `${schedule.slotDuration} min`,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (schedule) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(schedule)}
            aria-label={`Edit schedule for ${doctorLabel(schedule.doctorId)}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(schedule)}
            aria-label={`Delete schedule for ${doctorLabel(schedule.doctorId)}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isError) {
    return <ErrorBanner message="Could not load schedules." onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Doctor Schedules
          </h1>
          <p className="text-lg text-muted-foreground">
            Define weekly availability for each doctor.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Add schedule
        </Button>
      </header>

      <div className="w-full max-w-xs space-y-2">
        <Label htmlFor="doctorFilter">Doctor</Label>
        <Select value={selectedDoctor} onValueChange={(value) => setSelectedDoctor(value ?? "")}>
          <SelectTrigger id="doctorFilter" className="w-full">
            <SelectValue placeholder="All doctors" />
          </SelectTrigger>
          <SelectContent>
            {(doctors ?? []).map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Doctor {doctor.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <Skeleton variant="calendar" />
      ) : schedules.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={<Clock className="size-12" />}
            title="No schedules yet"
            description="Add a weekly schedule for a doctor to get started."
          />
        </div>
      ) : !selectedDoctor ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={<Clock className="size-12" />}
            title="Select a doctor"
            description="Choose a doctor above to view their weekly calendar."
            className="py-10"
          />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Weekly calendar
            </h2>
            <WeeklyCalendar schedules={doctorSchedules} />
          </div>

          <DataTable
            columns={columns}
            data={doctorSchedules}
            sortable
            emptyState={
              <EmptyState
                icon={<Clock className="size-12" />}
                title="No schedules for this doctor"
                description="Add a schedule to define this doctor's availability."
              />
            }
          />
        </>
      )}

      {creating && (
        <ScheduleFormModal
          open
          onClose={() => setCreating(false)}
          doctors={doctors ?? []}
          isSubmitting={isCreating}
          onSubmit={(data) => {
            createSchedule(data as CreateDoctorScheduleInput, {
              onSuccess: () => setCreating(false),
            });
          }}
        />
      )}

      {editing && (
        <ScheduleFormModal
          open
          onClose={() => setEditing(null)}
          schedule={editing}
          doctors={doctors ?? []}
          isSubmitting={isUpdating}
          onSubmit={(data) => {
            updateSchedule(
              { id: editing.id, data: data as UpdateDoctorScheduleInput },
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
            deleteSchedule(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete schedule"
          message={`Delete this schedule entry? Any slots created from it will also be deleted.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
