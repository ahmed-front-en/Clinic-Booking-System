"use client";

import { memo } from "react";
import { CalendarDays, MessageSquareQuote } from "lucide-react";
import { StarRating } from "@/components/business/StarRating";
import { formatDateTime } from "@/lib/utils";
import type { ReviewReadModel } from "@/types/models/review";

interface ReviewCardProps {
  review: ReviewReadModel;
}

export const ReviewCard = memo(function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-outline-variant">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquareQuote className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {review.doctor.displayName}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3" aria-hidden="true" />
              {formatDateTime(review.slot.date, review.slot.startTime)}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} readonly />
      </div>

      {review.comment ? (
        <p className="text-sm text-foreground">{review.comment}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">No comment provided.</p>
      )}
    </div>
  );
});
