"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsersAdmin } from "../api/users-admin";
import { queryKeys } from "@/lib/query-keys";
import { STALE_TIMES } from "@/config";
import type { PaginationParams } from "@/types/api";
import type { UserFilters } from "@/types/models/user";

export function useUsersAdmin(params: UserFilters & PaginationParams) {
  return useQuery({
    queryKey: queryKeys.users.all(params),
    queryFn: () => getUsersAdmin(params),
    staleTime: STALE_TIMES.adminLists,
  });
}
