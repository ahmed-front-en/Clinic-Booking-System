"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyReviews } from "../api/reviews";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function useMyReviews() {
  return useQuery({
    queryKey: queryKeys.reviews.mine,
    queryFn: getMyReviews,
    staleTime: STALE_TIMES.myReviews,
  });
}
