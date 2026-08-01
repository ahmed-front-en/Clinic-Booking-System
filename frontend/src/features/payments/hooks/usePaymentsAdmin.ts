"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentsAdmin } from "../api/payments-admin";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";
import type { PaginationParams } from "@/types/api";

export function usePaymentsAdmin(params: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.payments.admin(params),
    queryFn: () => getPaymentsAdmin(params),
    staleTime: STALE_TIMES.adminLists,
  });
}
