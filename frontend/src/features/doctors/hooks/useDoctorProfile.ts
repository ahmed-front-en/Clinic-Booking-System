"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../api/doctors";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";

export function useDoctorProfile() {
  return useQuery({
    queryKey: queryKeys.doctors.me,
    queryFn: getMyProfile,
    staleTime: STALE_TIMES.myProfile,
  });
}
