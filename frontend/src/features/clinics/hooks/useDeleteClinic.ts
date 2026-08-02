"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { deleteClinic } from "../api/clinics-admin";
import type { ClinicRecord } from "@/types/models/clinic";

export function useDeleteClinic() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: deleteClinic,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["clinics"] });
      const previous = queryClient.getQueriesData({ queryKey: ["clinics"] });

      queryClient.setQueriesData<ClinicRecord[]>(
        { queryKey: ["clinics"] },
        (old) => (old ? old.filter((clinic) => clinic.id !== id) : old),
      );

      return { previous };
    },
    onError: (error, _id, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      showToast("Clinic deleted", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clinics.all });
    },
  });
}
