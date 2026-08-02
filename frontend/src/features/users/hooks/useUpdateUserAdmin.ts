"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiError } from "@/hooks/useApiError";
import { showToast } from "@/lib/toast-store";
import { updateUserAdmin } from "../api/users-admin";
import type { PaginatedData } from "@/types/api";
import type { UserRecord, UserUpdateRequest } from "@/types/models/user";

type UpdateUserVariables = {
  id: string;
  data: UserUpdateRequest;
};

function updateUserInPaginatedList(
  data: PaginatedData<UserRecord>,
  id: string,
  patch: UserUpdateRequest,
): PaginatedData<UserRecord> {
  return {
    ...data,
    data: data.data.map((user) =>
      user.id === id ? { ...user, ...patch } : user,
    ),
  };
}

export function useUpdateUserAdmin() {
  const queryClient = useQueryClient();
  const { parse } = useApiError();

  return useMutation({
    mutationFn: ({ id, data }: UpdateUserVariables) => updateUserAdmin(id, data),
    onMutate: async ({ id, data }: UpdateUserVariables) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previous = queryClient.getQueriesData({ queryKey: ["users"] });

      queryClient.setQueriesData<PaginatedData<UserRecord>>(
        { queryKey: ["users"] },
        (old) =>
          old ? updateUserInPaginatedList(old, id, data) : old,
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      const { message } = parse(error);
      showToast(message, "error");
    },
    onSuccess: () => {
      showToast("User updated successfully", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
