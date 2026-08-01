import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { SpecialtyRecord } from "@/types/models/specialty";
import type { CreateSpecialtyInput, UpdateSpecialtyInput } from "@/schemas/specialty";

export async function createSpecialty(
  data: CreateSpecialtyInput,
): Promise<SpecialtyRecord> {
  const response = await api.post<ApiResponse<SpecialtyRecord>>("/admin/specialties", data);
  return response.data.data;
}

export async function updateSpecialty(
  id: string,
  data: UpdateSpecialtyInput,
): Promise<SpecialtyRecord> {
  const response = await api.patch<ApiResponse<SpecialtyRecord>>(
    `/admin/specialties/${id}`,
    data,
  );
  return response.data.data;
}

export async function deleteSpecialty(id: string): Promise<void> {
  await api.delete(`/admin/specialties/${id}`);
}
