"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Pencil, Trash2, Users } from "lucide-react";
import type { Column, DataTableProps } from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { SearchInput } from "@/components/data/SearchInput";
import { FilterDropdown, type FilterOption } from "@/components/data/FilterDropdown";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Button } from "@/components/ui/button";

const DataTable = dynamic(
  () => import("@/components/data/DataTable").then((mod) => mod.DataTable),
  { loading: () => <Skeleton variant="table" /> },
) as <T extends object>(props: DataTableProps<T>) => React.JSX.Element;

const UserFormModal = dynamic(
  () => import("@/components/business/UserFormModal").then((mod) => mod.UserFormModal),
  { loading: () => <Skeleton variant="form" /> },
);

const ConfirmDialog = dynamic(
  () => import("@/components/business/ConfirmDialog").then((mod) => mod.ConfirmDialog),
  { loading: () => <Skeleton variant="form" /> },
);
import {
  useUsersAdmin,
  useUpdateUserAdmin,
  useDeleteUserAdmin,
} from "@/features/users";
import { PAGINATION_DEFAULTS } from "@/config";
import type { UserRecord } from "@/types/models/user";
import type { UpdateUserInput } from "@/schemas/user";

const roleOptions: FilterOption[] = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "admin", label: "Admin" },
];

const verifiedOptions: FilterOption[] = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Not verified" },
];

export default function AdminUsersPage() {
  const [page, setPage] = useState<number>(PAGINATION_DEFAULTS.page);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState<UserRecord | null>(null);

  const { data, isPending, isError, refetch } = useUsersAdmin({
    page,
    limit: PAGINATION_DEFAULTS.limit,
    search: search || undefined,
    role: role as UserRecord["role"],
    isVerified,
  });
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUserAdmin();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUserAdmin();

  const users = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleRoleChange(value: string | undefined) {
    setRole(value);
    setPage(1);
  }

  function handleVerifiedChange(value: string | undefined) {
    setIsVerified(value === undefined ? undefined : value === "true");
    setPage(1);
  }

  const columns: Column<UserRecord>[] = useMemo(() => [
    { key: "email", header: "Email", sortable: true },
    {
      key: "role",
      header: "Role",
      render: (user) => <span className="capitalize">{user.role}</span>,
    },
    {
      key: "isVerified",
      header: "Verified",
      render: (user) =>
        user.isVerified ? (
          <span className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-gray-500/20 bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-400">
            Not verified
          </span>
        ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(user)}
            aria-label={`Edit ${user.email}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(user)}
            aria-label={`Delete ${user.email}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
        <p className="text-lg text-muted-foreground">
          Manage user accounts, roles, and verification status.
        </p>
      </header>

      {isError ? (
        <ErrorBanner message="Could not load users." onRetry={refetch} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full max-w-xs">
              <SearchInput
                value={search}
                onChange={handleSearch}
                placeholder="Search by email..."
              />
            </div>
            <FilterDropdown
              options={roleOptions}
              value={role}
              onChange={handleRoleChange}
              label="Role"
              placeholder="All roles"
            />
            <FilterDropdown
              options={verifiedOptions}
              value={isVerified === undefined ? undefined : String(isVerified)}
              onChange={handleVerifiedChange}
              label="Verification"
              placeholder="All"
            />
          </div>

          <DataTable
            columns={columns}
            data={users}
            loading={isPending}
            sortable
            emptyState={
              <EmptyState
                icon={<Users className="size-12" />}
                title="No users found"
                description="No users match the current search and filters."
              />
            }
          />

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {editing && (
        <UserFormModal
          open
          onClose={() => setEditing(null)}
          user={editing}
          isSubmitting={isUpdating}
          onSubmit={(data: UpdateUserInput) => {
            updateUser(
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
            deleteUser(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete user"
          message={`Delete ${deleting.email}? The account will be soft-deleted and can no longer sign in.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
