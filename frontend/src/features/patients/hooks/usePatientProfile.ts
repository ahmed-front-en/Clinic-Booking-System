"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../api/patients";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function usePatientProfile() {
  return useQuery({
    queryKey: queryKeys.patients.me,
    queryFn: getMyProfile,
    staleTime: STALE_TIMES.myProfile,
  });
}
