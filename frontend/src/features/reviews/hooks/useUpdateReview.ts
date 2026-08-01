"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { updateReview } from "../api/reviews-admin";

export function useUpdateReview() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateReview>[1] }) =>
      updateReview(id, data),
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      showToast("Review updated successfully", "success");
    },
  });
}
