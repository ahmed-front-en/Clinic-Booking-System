"use client";

import { useQuery } from "@tanstack/react-query";
import { getAvailableSlots } from "../api/slots";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";
import type { AvailableSlotsParams } from "@/types/models/slot";

export function useAvailableSlots(params?: AvailableSlotsParams) {
  return useQuery({
    queryKey: queryKeys.slots.available(params),
    queryFn: () => getAvailableSlots(params),
    enabled: Boolean(params?.doctorId),
    staleTime: STALE_TIMES.availableSlots,
  });
}
