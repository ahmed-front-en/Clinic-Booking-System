"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Pencil, Star, Trash2 } from "lucide-react";
import type { Column, DataTableProps } from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { StarRating } from "@/components/business/StarRating";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

const DataTable = dynamic(
  () => import("@/components/data/DataTable").then((mod) => mod.DataTable),
  { loading: () => <Skeleton variant="table" /> },
) as <T extends object>(props: DataTableProps<T>) => React.JSX.Element;

const ReviewDetailModal = dynamic(
  () => import("@/components/business/ReviewDetailModal").then((mod) => mod.ReviewDetailModal),
  { loading: () => <Skeleton variant="form" /> },
);

const ConfirmDialog = dynamic(
  () => import("@/components/business/ConfirmDialog").then((mod) => mod.ConfirmDialog),
  { loading: () => <Skeleton variant="form" /> },
);
import {
  useReviewsAdmin,
  useUpdateReview,
  useDeleteReview,
} from "@/features/reviews";
import { getReviewsAdmin } from "@/features/reviews/api/reviews-admin";
import { usePrefetchAdminPage } from "@/hooks/usePrefetchAdminPage";
import { queryKeys } from "@/lib/query-keys";
import { PAGINATION_DEFAULTS } from "@/config";
import type { ReviewReadModel } from "@/types/models/review";
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

  const [editing, setEditing] = useState<ReviewReadModel | null>(null);
  const [deleting, setDeleting] = useState<ReviewReadModel | null>(null);

  const reviews = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const prefetchPage = usePrefetchAdminPage({
    queryKey: queryKeys.reviews.admin,
    queryFn: getReviewsAdmin,
    params: { page, limit: PAGINATION_DEFAULTS.limit },
    page,
    totalPages,
  });

  const columns: Column<ReviewReadModel>[] = useMemo(() => [
    {
      key: "appointmentId",
      header: "Appointment",
      render: (review) =>
        `${review.doctor.displayName} · ${formatDateTime(review.slot.date, review.slot.startTime)}`,
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
            aria-label={`Edit review for ${review.doctor.displayName}`}
            title={`Edit review for ${review.doctor.displayName}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleting(review)}
            aria-label={`Delete review for ${review.doctor.displayName}`}
            title={`Delete review for ${review.doctor.displayName}`}
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
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onPagePrefetch={prefetchPage}
          />
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
