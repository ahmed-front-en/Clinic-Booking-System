"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { createPayment } from "../api/payments";

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: createPayment,
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.mine });
      showToast("Payment submitted successfully", "success");
    },
  });
}
