import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { SpecialtyRecord } from "@/types/models/specialty";

export async function getSpecialties(): Promise<SpecialtyRecord[]> {
  const response = await api.get<ApiResponse<SpecialtyRecord[]>>("/specialties");
  return response.data.data;
}
