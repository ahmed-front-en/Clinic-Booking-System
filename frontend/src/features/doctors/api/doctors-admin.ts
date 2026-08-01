import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DoctorRecord } from "@/types/models/doctor";
import type { CreateDoctorInput, UpdateDoctorInput } from "@/schemas/doctor";

export async function createDoctor(data: CreateDoctorInput): Promise<DoctorRecord> {
  const response = await api.post<ApiResponse<DoctorRecord>>("/admin/doctors", data);
  return response.data.data;
}

export async function updateDoctor(
  id: string,
  data: UpdateDoctorInput,
): Promise<DoctorRecord> {
  const response = await api.patch<ApiResponse<DoctorRecord>>(`/admin/doctors/${id}`, data);
  return response.data.data;
}

export async function deleteDoctor(id: string): Promise<void> {
  await api.delete(`/admin/doctors/${id}`);
}
