"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyAppointments } from "../api/appointments";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function useMyAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments.mine,
    queryFn: getMyAppointments,
    staleTime: STALE_TIMES.myAppointments,
  });
}
