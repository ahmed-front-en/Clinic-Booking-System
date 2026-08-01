import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ClinicRecord } from "@/types/models/clinic";
import type { CreateClinicInput, UpdateClinicInput } from "@/schemas/clinic";

export async function createClinic(data: CreateClinicInput): Promise<ClinicRecord> {
  const response = await api.post<ApiResponse<ClinicRecord>>("/admin/clinics", data);
  return response.data.data;
}

export async function updateClinic(
  id: string,
  data: UpdateClinicInput,
): Promise<ClinicRecord> {
  const response = await api.patch<ApiResponse<ClinicRecord>>(`/admin/clinics/${id}`, data);
  return response.data.data;
}

export async function deleteClinic(id: string): Promise<void> {
  await api.delete(`/admin/clinics/${id}`);
}
