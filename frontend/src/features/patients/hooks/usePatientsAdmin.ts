"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientsAdmin } from "../api/patients-admin";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";
import type { PaginationParams } from "@/types/api";

export function usePatientsAdmin(params: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.patients.all(params),
    queryFn: () => getPatientsAdmin(params),
    staleTime: STALE_TIMES.adminLists,
  });
}
