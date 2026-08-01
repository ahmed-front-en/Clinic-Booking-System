"use client";

import { useQuery } from "@tanstack/react-query";
import { getReviewsAdmin } from "../api/reviews-admin";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";
import type { PaginationParams } from "@/types/api";

export function useReviewsAdmin(params: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.reviews.admin(params),
    queryFn: () => getReviewsAdmin(params),
    staleTime: STALE_TIMES.adminLists,
  });
}
