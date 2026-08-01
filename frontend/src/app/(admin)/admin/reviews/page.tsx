"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { ReviewDetailModal } from "@/components/business/ReviewDetailModal";
import { ConfirmDialog } from "@/components/business/ConfirmDialog";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StarRating } from "@/components/business/StarRating";
import { Button } from "@/components/ui/button";
import {
  useReviewsAdmin,
  useUpdateReview,
  useDeleteReview,
} from "@/features/reviews";
import { PAGINATION_DEFAULTS } from "@/config";
import type { ReviewRecord } from "@/types/models/review";
import type { UpdateReviewInput } from "@/schemas/review";

const truncate = (value: string, length = 40) =>
  value.length > length ? `${value.slice(0, length)}…` : value;

export default function AdminReviewsPage() {
  const [page, setPage] = useState<number>(PAGINATION_DEFAULTS.page);
  const { data, isPending, isError, refetch } = useReviewsAdmin({
    page,
    limit: PAGINATION_DEFAULTS.limit,
  });
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  const [editing, setEditing] = useState<ReviewRecord | null>(null);
  const [deleting, setDeleting] = useState<ReviewRecord | null>(null);

  const reviews = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const columns: Column<ReviewRecord>[] = [
    {
      key: "appointmentId",
      header: "Appointment",
      render: (review) => truncate(review.appointmentId, 10),
    },
    {
      key: "rating",
      header: "Rating",
      render: (review) => <StarRating rating={review.rating} readonly size="sm" />,
    },
    {
      key: "comment",
      header: "Comment",
      render: (review) =>
        review.comment ? (
          <span className="text-muted-foreground">{truncate(review.comment)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (review) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(review)}
            aria-label={`Edit review ${truncate(review.id, 10)}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(review)}
            aria-label={`Delete review ${truncate(review.id, 10)}`}
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reviews</h1>
        <p className="text-lg text-muted-foreground">
          Moderate patient reviews across the platform.
        </p>
      </header>

      {isError ? (
        <ErrorBanner message="Could not load reviews." onRetry={refetch} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={reviews}
            loading={isPending}
            sortable
            emptyState={
              <EmptyState
                icon={<Star className="size-12" />}
                title="No reviews yet"
                description="Reviews left by patients will appear here."
              />
            }
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {editing && (
        <ReviewDetailModal
          open
          onClose={() => setEditing(null)}
          review={editing}
          isSubmitting={isUpdating}
          onSubmit={(data: UpdateReviewInput) => {
            updateReview(
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
            deleteReview(deleting.id, { onSuccess: () => setDeleting(null) })
          }
          title="Delete review"
          message="Delete this review? This cannot be undone."
          confirmLabel="Delete"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
