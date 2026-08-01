import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedData,
  PaginationParams,
} from "@/types/api";
import type { AppointmentRecord } from "@/types/models/appointment";
import type { UpdateAppointmentInput } from "@/schemas/appointment";

export async function getAppointmentsAdmin(
  params: PaginationParams,
): Promise<PaginatedData<AppointmentRecord>> {
  const response = await api.get<PaginatedApiResponse<AppointmentRecord>>(
    "/appointments",
    { params },
  );
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function updateAppointment(
  id: string,
  data: UpdateAppointmentInput,
): Promise<AppointmentRecord> {
  const response = await api.patch<ApiResponse<AppointmentRecord>>(
    `/appointments/${id}`,
    data,
  );
  return response.data.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}
