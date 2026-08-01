"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { updateDoctor } from "../api/doctors-admin";

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateDoctor>[1] }) =>
      updateDoctor(id, data),
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
      showToast("Doctor updated successfully", "success");
    },
  });
}
