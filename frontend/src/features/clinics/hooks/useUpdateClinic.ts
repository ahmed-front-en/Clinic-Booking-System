"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { updateClinic } from "../api/clinics-admin";

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateClinic>[1] }) =>
      updateClinic(id, data),
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clinics.all });
      showToast("Clinic updated successfully", "success");
    },
  });
}
