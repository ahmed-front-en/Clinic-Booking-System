"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { createPatient } from "../api/patients-admin";

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: createPatient,
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showToast("Patient created successfully", "success");
    },
  });
}
