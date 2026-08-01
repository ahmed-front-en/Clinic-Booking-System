"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { createReview } from "../api/reviews";

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: createReview,
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.mine });
      showToast("Review submitted successfully", "success");
    },
  });
}
