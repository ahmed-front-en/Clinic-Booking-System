"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPayments } from "../api/payments";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.payments.mine,
    queryFn: getMyPayments,
    staleTime: STALE_TIMES.myPayments,
  });
}
