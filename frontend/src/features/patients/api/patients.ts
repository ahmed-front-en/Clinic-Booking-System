import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { PatientRecord } from "@/types/models/patient";
import type { UpdatePatientInput } from "@/schemas/patient";

export async function getMyProfile(): Promise<PatientRecord> {
  const response = await api.get<ApiResponse<PatientRecord>>("/patients/me");
  return response.data.data;
}

export async function updateMyProfile(
  data: UpdatePatientInput,
): Promise<PatientRecord> {
  const response = await api.patch<ApiResponse<PatientRecord>>("/patients/me", data);
  return response.data.data;
}
