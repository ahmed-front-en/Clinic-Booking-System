"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { queryKeys } from "@/lib/query-keys";
import { cancelMyAppointment } from "../api/appointments";
import type { AppointmentRecord } from "@/types/models/appointment";

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: cancelMyAppointment,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments.mine });
      const previous = queryClient.getQueryData<AppointmentRecord[]>(
        queryKeys.appointments.mine,
      );
      if (previous) {
        queryClient.setQueryData<AppointmentRecord[]>(
          queryKeys.appointments.mine,
          previous.map((appointment) =>
            appointment.id === id
              ? { ...appointment, status: "cancelled" as const }
              : appointment,
          ),
        );
      }
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.appointments.mine, context.previous);
      }
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.mine });
      showToast("Appointment cancelled", "success");
    },
  });
}
