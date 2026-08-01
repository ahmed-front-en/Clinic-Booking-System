import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ClinicRecord } from "@/types/models/clinic";

export async function getClinics(): Promise<ClinicRecord[]> {
  const response = await api.get<ApiResponse<ClinicRecord[]>>("/clinics");
  return response.data.data;
}
