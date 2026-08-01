"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { updateSpecialty } from "../api/specialties-admin";

export function useUpdateSpecialty() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateSpecialty>[1];
    }) => updateSpecialty(id, data),
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.specialties.all });
      showToast("Specialty updated successfully", "success");
    },
  });
}
