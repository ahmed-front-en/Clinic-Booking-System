"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { updateMyProfile } from "../api/patients";
import type { PatientRecord } from "@/types/models/patient";
import type { UpdatePatientInput } from "@/schemas/patient";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: updateMyProfile,
    onMutate: async (data: UpdatePatientInput) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.me });
      const previous = queryClient.getQueryData<PatientRecord>(
        queryKeys.patients.me,
      );
      if (previous) {
        queryClient.setQueryData<PatientRecord>(
          queryKeys.patients.me,
          (old) => (old ? { ...old, ...data } : old),
        );
      }
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.patients.me, context.previous);
      }
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      showToast("Profile updated successfully", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.me });
    },
  });
}
