import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DoctorRecord, DoctorReadModel } from "@/types/models/doctor";
import type { UpdateMyDoctorInput } from "@/schemas/doctor";

export async function getDoctors(): Promise<DoctorReadModel[]> {
  const response = await api.get<ApiResponse<DoctorReadModel[]>>("/doctors");
  return response.data.data;
}

export async function getDoctorById(id: string): Promise<DoctorRecord> {
  const response = await api.get<ApiResponse<DoctorRecord>>(`/doctors/${id}`);
  return response.data.data;
}

export async function getMyProfile(): Promise<DoctorReadModel> {
  const response = await api.get<ApiResponse<DoctorReadModel>>("/doctors/me");
  return response.data.data;
}

export async function updateMyProfile(data: UpdateMyDoctorInput): Promise<DoctorReadModel> {
  const response = await api.patch<ApiResponse<DoctorReadModel>>("/doctors/me", data);
  return response.data.data;
}
