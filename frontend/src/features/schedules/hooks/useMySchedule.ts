"use client";

import { useQuery } from "@tanstack/react-query";
import { getMySchedule } from "../api/schedules";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function useMySchedule() {
  return useQuery({
    queryKey: queryKeys.schedules.me,
    queryFn: getMySchedule,
    staleTime: STALE_TIMES.mySchedule,
  });
}
