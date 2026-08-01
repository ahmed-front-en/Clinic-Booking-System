"use client";

import { useState } from "react";
import { Pencil, Plus, Stethoscope, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data/DataTable";
import { SpecialtyFormModal } from "@/components/business/SpecialtyFormModal";
import { ConfirmDialog } from "@/components/business/ConfirmDialog";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { useSpecialtiesList } from "@/features/specialties";
import {
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
} from "@/features/specialties";
import type { SpecialtyRecord } from "@/types/models/specialty";
import type { CreateSpecialtyInput, UpdateSpecialtyInput } from "@/schemas/specialty";

export default function AdminSpecialtiesPage() {
  const {
    data: specialties,
    isPending,
    isError,
    refetch,
  } = useSpecialtiesList();
  const { mutate: createSpecialty, isPending: isCreating } = useCreateSpecialty();
  const { mutate: updateSpecialty, isPending: isUpdating } = useUpdateSpecialty();
  const { mutate: deleteSpecialty, isPending: isDeleting } = useDeleteSpecialty();

  const [editing, setEditing] = useState<SpecialtyRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<SpecialtyRecord | null>(null);

  const columns: Column<SpecialtyRecord>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (specialty) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(specialty)}
            aria-label={`Edit ${specialty.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(specialty)}
            aria-label={`Delete ${specialty.name}`}
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Specialties
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage medical specialties.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Add specialty
        </Button>
      </header>

      {isError ? (
        <ErrorBanner message="Could not load specialties." onRetry={refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={specialties ?? []}
          loading={isPending}
          sortable
          emptyState={
            <EmptyState
              icon={<Stethoscope className="size-12" />}
              title="No specialties yet"
              description="Create your first specialty to get started."
            />
          }
        />
      )}

      {creating && (
        <SpecialtyFormModal
          open
          onClose={() => setCreating(false)}
          isSubmitting={isCreating}
          onSubmit={(data) => {
            createSpecialty(data as CreateSpecialtyInput, { onSuccess: () => setCreating(false) });
          }}
        />
      )}

      {editing && (
        <SpecialtyFormModal
          open
          onClose={() => setEditing(null)}
          specialty={editing}
          isSubmitting={isUpdating}
          onSubmit={(data) => {
            updateSpecialty(
              { id: editing.id, data: data as UpdateSpecialtyInput },
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
            deleteSpecialty(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete specialty"
          message={`Delete ${deleting.name}? This cannot be undone. Deleting fails if any doctor is assigned to this specialty.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
