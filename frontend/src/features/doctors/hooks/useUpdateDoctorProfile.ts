"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { updateMyProfile } from "../api/doctors";

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: updateMyProfile,
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.me });
      showToast("Profile updated successfully", "success");
    },
  });
}
