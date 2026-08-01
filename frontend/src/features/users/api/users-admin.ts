import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedData,
  PaginationParams,
} from "@/types/api";
import type {
  UserFilters,
  UserRecord,
  UserUpdateRequest,
} from "@/types/models/user";

export async function getUsersAdmin(
  params: UserFilters & PaginationParams,
): Promise<PaginatedData<UserRecord>> {
  const response = await api.get<PaginatedApiResponse<UserRecord>>("/admin/users", {
    params,
  });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function updateUserAdmin(
  id: string,
  data: UserUpdateRequest,
): Promise<UserRecord> {
  const response = await api.patch<ApiResponse<UserRecord>>(`/admin/users/${id}`, data);
  return response.data.data;
}

export async function deleteUserAdmin(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}
