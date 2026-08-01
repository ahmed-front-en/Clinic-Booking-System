"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { updateSlot } from "../api/slots-admin";

export function useUpdateSlot() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateSlot>[1] }) =>
      updateSlot(id, data),
    onError: (error) => {
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      showToast("Appointment slot updated successfully", "success");
    },
  });
}
