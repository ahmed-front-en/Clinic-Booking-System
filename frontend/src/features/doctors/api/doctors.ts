import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DoctorRecord, DoctorReadModel } from "@/types/models/doctor";

export async function getDoctors(): Promise<DoctorReadModel[]> {
  const response = await api.get<ApiResponse<DoctorReadModel[]>>("/doctors");
  return response.data.data;
}

export async function getDoctorById(id: string): Promise<DoctorRecord> {
  const response = await api.get<ApiResponse<DoctorRecord>>(`/doctors/${id}`);
  return response.data.data;
}
