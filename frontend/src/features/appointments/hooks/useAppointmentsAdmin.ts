"use client";

import { useQuery } from "@tanstack/react-query";
import { getAppointmentsAdmin } from "../api/appointments-admin";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";
import type { PaginationParams } from "@/types/api";

export function useAppointmentsAdmin(params: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.appointments.admin(params),
    queryFn: () => getAppointmentsAdmin(params),
    staleTime: STALE_TIMES.adminLists,
  });
}
