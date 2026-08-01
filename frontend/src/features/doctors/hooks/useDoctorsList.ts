"use client";

import { useQuery } from "@tanstack/react-query";
import { getDoctors } from "../api/doctors";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

interface UseDoctorsListOptions {
  clinicId?: string | null;
  specialtyId?: string | null;
}

export function useDoctorsList(options?: UseDoctorsListOptions) {
  const query = useQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: getDoctors,
    staleTime: STALE_TIMES.doctors,
  });

  const clinicId = options?.clinicId;
  const specialtyId = options?.specialtyId;

  const filtered = (query.data ?? []).filter((doctor) => {
    if (clinicId && doctor.clinicId !== clinicId) return false;
    if (specialtyId && doctor.specialtyId !== specialtyId) return false;
    return true;
  });

  return { ...query, data: filtered };
}
