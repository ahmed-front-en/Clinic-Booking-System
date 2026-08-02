"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CreditCard, Pencil, Trash2 } from "lucide-react";
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

const PaymentFormModal = dynamic(
  () => import("@/components/business/PaymentFormModal").then((mod) => mod.PaymentFormModal),
  { loading: () => <Skeleton variant="form" /> },
);

const ConfirmDialog = dynamic(
  () => import("@/components/business/ConfirmDialog").then((mod) => mod.ConfirmDialog),
  { loading: () => <Skeleton variant="form" /> },
);
import {
  usePaymentsAdmin,
  useUpdatePayment,
  useDeletePayment,
} from "@/features/payments";
import { formatCurrency } from "@/lib/utils";
import { PAGINATION_DEFAULTS } from "@/config";
import type { PaymentRecord } from "@/types/models/payment";
import type { UpdatePaymentInput } from "@/schemas/payment";

const truncate = (value: string, length = 10) =>
  value.length > length ? `${value.slice(0, length)}…` : value;

export default function AdminPaymentsPage() {
  const [page, setPage] = useState<number>(PAGINATION_DEFAULTS.page);
  const { data, isPending, isError, refetch } = usePaymentsAdmin({
    page,
    limit: PAGINATION_DEFAULTS.limit,
  });
  const { mutate: updatePayment, isPending: isUpdating } = useUpdatePayment();
  const { mutate: deletePayment, isPending: isDeleting } = useDeletePayment();

  const [editing, setEditing] = useState<PaymentRecord | null>(null);
  const [deleting, setDeleting] = useState<PaymentRecord | null>(null);

  const payments = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const columns: Column<PaymentRecord>[] = [
    {
      key: "appointmentId",
      header: "Appointment",
      render: (payment) => truncate(payment.appointmentId),
    },
    {
      key: "amount",
      header: "Amount",
      render: (payment) => formatCurrency(payment.amount),
    },
    {
      key: "method",
      header: "Method",
      render: (payment) => payment.method.replace(/_/g, " "),
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: "transactionReference",
      header: "Reference",
      render: (payment) =>
        payment.transactionReference ?? (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (payment) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(payment)}
            aria-label={`Edit payment ${truncate(payment.id)}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(payment)}
            aria-label={`Delete payment ${truncate(payment.id)}`}
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments</h1>
        <p className="text-lg text-muted-foreground">
          Review payments and update their status.
        </p>
      </header>

      {isError ? (
        <ErrorBanner message="Could not load payments." onRetry={refetch} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={payments}
            loading={isPending}
            sortable
            emptyState={
              <EmptyState
                icon={<CreditCard className="size-12" />}
                title="No payments yet"
                description="Payments made for appointments will appear here."
              />
            }
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {editing && (
        <PaymentFormModal
          open
          onClose={() => setEditing(null)}
          payment={editing}
          isSubmitting={isUpdating}
          onSubmit={(data: UpdatePaymentInput) => {
            updatePayment(
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
            deletePayment(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete payment"
          message={`Delete payment ${truncate(deleting.id)}? This cannot be undone.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
