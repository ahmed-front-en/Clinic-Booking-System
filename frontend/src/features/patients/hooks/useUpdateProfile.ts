"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { updateMyProfile } from "../api/patients";
import type { UpdatePatientInput } from "@/schemas/patient";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: updateMyProfile,
    onMutate: async (data: UpdatePatientInput) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.patients.me });
      const previous = queryClient.getQueryData(queryKeys.patients.me);
      if (previous) {
        queryClient.setQueryData(queryKeys.patients.me, {
          ...(previous as object),
          ...data,
        });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.me });
      showToast("Profile updated successfully", "success");
    },
  });
}
