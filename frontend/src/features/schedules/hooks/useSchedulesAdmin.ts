"use client";

import { useQuery } from "@tanstack/react-query";
import { getSchedulesAdmin } from "../api/schedules-admin";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";
import type { PaginationParams } from "@/types/api";

export function useSchedulesAdmin(params: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.schedules.admin(params),
    queryFn: () => getSchedulesAdmin(params),
    staleTime: STALE_TIMES.adminLists,
  });
}
