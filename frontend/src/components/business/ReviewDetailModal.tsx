"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/business/StarRating";
import { updateReviewSchema, type UpdateReviewInput } from "@/schemas/review";
import type { ReviewRecord } from "@/types/models/review";
import { useApiError } from "@/hooks/useApiError";

interface ReviewDetailModalProps {
  open: boolean;
  onClose: () => void;
  review: ReviewRecord;
  onSubmit: (data: UpdateReviewInput) => void;
  isSubmitting?: boolean;
}

export function ReviewDetailModal({
  open,
  onClose,
  review,
  onSubmit,
  isSubmitting,
}: ReviewDetailModalProps) {
  const { parse } = useApiError();
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const result = updateReviewSchema.safeParse({
      rating,
      comment: comment.trim() === "" ? null : comment.trim(),
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    Promise.resolve(onSubmit(result.data)).catch((err: unknown) => {
      const { message } = parse(err);
      setFormError(message);
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Appointment <span className="font-medium text-foreground">#{review.appointmentId.slice(0, 8)}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <div id="rating" className="flex items-center gap-2">
                <StarRating rating={rating} onChange={setRating} />
                {fieldErrors.rating && (
                  <p className="text-xs text-destructive">{fieldErrors.rating}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                aria-invalid={Boolean(fieldErrors.comment)}
                disabled={isSubmitting}
              />
              {fieldErrors.comment && (
                <p className="text-xs text-destructive">{fieldErrors.comment}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Close
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
