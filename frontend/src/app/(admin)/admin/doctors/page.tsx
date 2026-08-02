"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
import type { Column, DataTableProps } from "@/components/data/DataTable";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Button } from "@/components/ui/button";

const DataTable = dynamic(
  () => import("@/components/data/DataTable").then((mod) => mod.DataTable),
  { loading: () => <Skeleton variant="table" /> },
) as <T extends object>(props: DataTableProps<T>) => React.JSX.Element;

const DoctorFormModal = dynamic(
  () => import("@/components/business/DoctorFormModal").then((mod) => mod.DoctorFormModal),
  { loading: () => <Skeleton variant="form" /> },
);

const ConfirmDialog = dynamic(
  () => import("@/components/business/ConfirmDialog").then((mod) => mod.ConfirmDialog),
  { loading: () => <Skeleton variant="form" /> },
);
import {
  useDoctorsList,
  useCreateDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
} from "@/features/doctors";
import { useClinicsList } from "@/features/clinics";
import { useSpecialtiesList } from "@/features/specialties";
import { useUsersAdmin } from "@/features/users";
import { formatCurrency } from "@/lib/utils";
import type { DoctorRecord } from "@/types/models/doctor";
import type { CreateDoctorInput, UpdateDoctorInput } from "@/schemas/doctor";

export default function AdminDoctorsPage() {
  const {
    data: doctors,
    isPending,
    isError,
    refetch,
  } = useDoctorsList();
  const { data: clinics } = useClinicsList();
  const { data: specialties } = useSpecialtiesList();
  const { data: doctorUsers } = useUsersAdmin({ role: "doctor", limit: 100 });

  const { mutate: createDoctor, isPending: isCreating } = useCreateDoctor();
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();
  const { mutate: deleteDoctor, isPending: isDeleting } = useDeleteDoctor();

  const [editing, setEditing] = useState<DoctorRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<DoctorRecord | null>(null);

  const users = useMemo(() => doctorUsers?.data ?? [], [doctorUsers]);

  const clinicName = useCallback(
    (id: string) =>
      clinics?.find((clinic) => clinic.id === id)?.name ?? id.slice(0, 8),
    [clinics],
  );
  const specialtyName = useCallback(
    (id: string) =>
      specialties?.find((specialty) => specialty.id === id)?.name ?? id.slice(0, 8),
    [specialties],
  );
  const doctorEmail = useCallback(
    (id: string) =>
      users.find((user) => user.id === id)?.email ?? id.slice(0, 8),
    [users],
  );

  const columns: Column<DoctorRecord>[] = useMemo(() => [
    {
      key: "userId",
      header: "User",
      render: (doctor) => doctorEmail(doctor.userId),
    },
    {
      key: "clinicId",
      header: "Clinic",
      render: (doctor) => clinicName(doctor.clinicId),
    },
    {
      key: "specialtyId",
      header: "Specialty",
      render: (doctor) => specialtyName(doctor.specialtyId),
    },
    {
      key: "consultationFee",
      header: "Fee",
      render: (doctor) => formatCurrency(doctor.consultationFee),
    },
    {
      key: "experienceYears",
      header: "Experience",
      render: (doctor) => `${doctor.experienceYears} yrs`,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (doctor) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(doctor)}
            aria-label={`Edit doctor ${doctorEmail(doctor.userId)}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(doctor)}
            aria-label={`Delete doctor ${doctorEmail(doctor.userId)}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [clinicName, specialtyName, doctorEmail]);

  if (isError) {
    return <ErrorBanner message="Could not load doctors." onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctors</h1>
          <p className="text-lg text-muted-foreground">
            Manage doctor profiles, clinics, and consultation fees.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Add doctor
        </Button>
      </header>

      {isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton variant="table" />
          <Skeleton variant="table" />
          <Skeleton variant="table" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={doctors ?? []}
          sortable
          emptyState={
            <EmptyState
              icon={<UserRound className="size-12" />}
              title="No doctors yet"
              description="Add a doctor to start scheduling appointments."
            />
          }
        />
      )}

      {creating && (
        <DoctorFormModal
          open
          onClose={() => setCreating(false)}
          users={users}
          clinics={clinics ?? []}
          specialties={specialties ?? []}
          isSubmitting={isCreating}
          onSubmit={(data) => {
            createDoctor(data as CreateDoctorInput, { onSuccess: () => setCreating(false) });
          }}
        />
      )}

      {editing && (
        <DoctorFormModal
          open
          onClose={() => setEditing(null)}
          doctor={editing}
          users={users}
          clinics={clinics ?? []}
          specialties={specialties ?? []}
          isSubmitting={isUpdating}
          onSubmit={(data) => {
            updateDoctor(
              { id: editing.id, data: data as UpdateDoctorInput },
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
            deleteDoctor(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete doctor"
          message={`Delete doctor ${doctorEmail(deleting.userId)}? Schedules and slots for this doctor will also be deleted.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
