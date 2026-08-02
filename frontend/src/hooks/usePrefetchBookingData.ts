"use client";

import { useCallback } from "react";
import { getClinics } from "@/features/clinics";
import { getSpecialties } from "@/features/specialties";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function usePrefetchBookingData() {
  const prefetch = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.clinics.all,
      queryFn: getClinics,
      staleTime: STALE_TIMES.clinics,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.specialties.all,
      queryFn: getSpecialties,
      staleTime: STALE_TIMES.specialties,
    });
  }, []);

  return prefetch;
}
