"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Column, DataTableProps } from "@/components/data/DataTable";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Button } from "@/components/ui/button";

const DataTable = dynamic(
  () => import("@/components/data/DataTable").then((mod) => mod.DataTable),
  { loading: () => <Skeleton variant="table" /> },
) as <T extends object>(props: DataTableProps<T>) => React.JSX.Element;

const ClinicFormModal = dynamic(
  () => import("@/components/business/ClinicFormModal").then((mod) => mod.ClinicFormModal),
  { loading: () => <Skeleton variant="form" /> },
);

const ConfirmDialog = dynamic(
  () => import("@/components/business/ConfirmDialog").then((mod) => mod.ConfirmDialog),
  { loading: () => <Skeleton variant="form" /> },
);
import { useClinicsList } from "@/features/clinics";
import {
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
} from "@/features/clinics";
import type { ClinicRecord } from "@/types/models/clinic";
import type { CreateClinicInput, UpdateClinicInput } from "@/schemas/clinic";

export default function AdminClinicsPage() {
  const { data: clinics, isPending, isError, refetch } = useClinicsList();
  const { mutate: createClinic, isPending: isCreating } = useCreateClinic();
  const { mutate: updateClinic, isPending: isUpdating } = useUpdateClinic();
  const { mutate: deleteClinic, isPending: isDeleting } = useDeleteClinic();

  const [editing, setEditing] = useState<ClinicRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ClinicRecord | null>(null);

  const columns: Column<ClinicRecord>[] = useMemo(() => [
    { key: "name", header: "Name", sortable: true },
    {
      key: "phone",
      header: "Phone",
      render: (clinic) => clinic.phone ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "city",
      header: "City",
      render: (clinic) => clinic.city ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "address",
      header: "Address",
      render: (clinic) => clinic.address ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (clinic) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(clinic)}
            aria-label={`Edit ${clinic.name}`}
            title={`Edit ${clinic.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(clinic)}
            aria-label={`Delete ${clinic.name}`}
            title={`Delete ${clinic.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clinics</h1>
          <p className="text-lg text-muted-foreground">
            Manage clinic locations.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Add clinic
        </Button>
      </header>

      {isError ? (
        <ErrorBanner message="Could not load clinics." onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={clinics ?? []}
          loading={isPending}
          sortable
          emptyState={
            <EmptyState
              icon={<Building2 className="size-12" />}
              title="No clinics yet"
              description="Create your first clinic to get started."
            />
          }
        />
      )}

      {creating && (
        <ClinicFormModal
          open
          onClose={() => setCreating(false)}
          isSubmitting={isCreating}
          onSubmit={(data) => {
            createClinic(data as CreateClinicInput, { onSuccess: () => setCreating(false) });
          }}
        />
      )}

      {editing && (
        <ClinicFormModal
          open
          onClose={() => setEditing(null)}
          clinic={editing}
          isSubmitting={isUpdating}
          onSubmit={(data) => {
            updateClinic(
              { id: editing.id, data: data as UpdateClinicInput },
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
            deleteClinic(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete clinic"
          message={`Delete ${deleting.name}? This cannot be undone. Deleting fails if any doctor is assigned to this clinic.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
