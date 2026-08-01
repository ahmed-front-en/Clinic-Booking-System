"use client";

import { useState } from "react";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { PatientFormModal } from "@/components/business/PatientFormModal";
import { ConfirmDialog } from "@/components/business/ConfirmDialog";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import {
  usePatientsAdmin,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/features/patients";
import { useUsersAdmin } from "@/features/users";
import { PAGINATION_DEFAULTS } from "@/config";
import type { PatientRecord } from "@/types/models/patient";
import type { CreatePatientInput, UpdatePatientInput } from "@/schemas/patient";

export default function AdminPatientsPage() {
  const [page, setPage] = useState<number>(PAGINATION_DEFAULTS.page);
  const { data, isPending, isError, refetch } = usePatientsAdmin({
    page,
    limit: PAGINATION_DEFAULTS.limit,
  });
  const { data: patientUsers } = useUsersAdmin({ role: "patient", limit: 100 });

  const { mutate: createPatient, isPending: isCreating } = useCreatePatient();
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();

  const [editing, setEditing] = useState<PatientRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<PatientRecord | null>(null);

  const patients = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const users = patientUsers?.data ?? [];

  const columns: Column<PatientRecord>[] = [
    { key: "fullName", header: "Full name", sortable: true },
    {
      key: "phone",
      header: "Phone",
      render: (patient) => patient.phone ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "gender",
      header: "Gender",
      render: (patient) => patient.gender ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "birthDate",
      header: "Date of birth",
      render: (patient) => patient.birthDate ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (patient) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(patient)}
            aria-label={`Edit ${patient.fullName}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(patient)}
            aria-label={`Delete ${patient.fullName}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patients</h1>
          <p className="text-lg text-muted-foreground">
            Manage patient profiles.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Add patient
        </Button>
      </header>

      {isError ? (
        <ErrorBanner message="Could not load patients." onRetry={refetch} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={patients}
            loading={isPending}
            sortable
            emptyState={
              <EmptyState
                icon={<ClipboardList className="size-12" />}
                title="No patients yet"
                description="Patient profiles will appear here once they register."
              />
            }
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {creating && (
        <PatientFormModal
          open
          onClose={() => setCreating(false)}
          users={users}
          isSubmitting={isCreating}
          onSubmit={(data) => {
            createPatient(data as CreatePatientInput, { onSuccess: () => setCreating(false) });
          }}
        />
      )}

      {editing && (
        <PatientFormModal
          open
          onClose={() => setEditing(null)}
          patient={editing}
          users={users}
          isSubmitting={isUpdating}
          onSubmit={(data) => {
            updatePatient(
              { id: editing.id, data: data as UpdatePatientInput },
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
            deletePatient(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete patient"
          message={`Delete patient profile for ${deleting.fullName}? This cannot be undone.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
