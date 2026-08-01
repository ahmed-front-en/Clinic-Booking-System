"use client";

import { useQuery } from "@tanstack/react-query";
import { getSlotsAdmin } from "../api/slots-admin";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";
import type { PaginationParams } from "@/types/api";

export function useSlotsAdmin(params: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.slots.admin(params),
    queryFn: () => getSlotsAdmin(params),
    staleTime: STALE_TIMES.adminLists,
  });
}
