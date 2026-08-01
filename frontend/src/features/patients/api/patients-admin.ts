import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedData,
  PaginationParams,
} from "@/types/api";
import type { PatientRecord } from "@/types/models/patient";
import type { CreatePatientInput, UpdatePatientInput } from "@/schemas/patient";

export async function getPatientsAdmin(
  params: PaginationParams,
): Promise<PaginatedData<PatientRecord>> {
  const response = await api.get<PaginatedApiResponse<PatientRecord>>("/patients", {
    params,
  });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function createPatient(data: CreatePatientInput): Promise<PatientRecord> {
  const response = await api.post<ApiResponse<PatientRecord>>("/patients", data);
  return response.data.data;
}

export async function updatePatient(
  id: string,
  data: UpdatePatientInput,
): Promise<PatientRecord> {
  const response = await api.patch<ApiResponse<PatientRecord>>(`/patients/${id}`, data);
  return response.data.data;
}

export async function deletePatient(id: string): Promise<void> {
  await api.delete(`/patients/${id}`);
}
