"use client";

import { useQuery } from "@tanstack/react-query";
import { getSpecialties } from "../api/specialties";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function useSpecialtiesList() {
  return useQuery({
    queryKey: queryKeys.specialties.all,
    queryFn: getSpecialties,
    staleTime: STALE_TIMES.specialties,
  });
}
