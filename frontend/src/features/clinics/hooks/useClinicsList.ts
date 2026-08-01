"use client";

import { useQuery } from "@tanstack/react-query";
import { getClinics } from "../api/clinics";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function useClinicsList() {
  return useQuery({
    queryKey: queryKeys.clinics.all,
    queryFn: getClinics,
    staleTime: STALE_TIMES.clinics,
  });
}
