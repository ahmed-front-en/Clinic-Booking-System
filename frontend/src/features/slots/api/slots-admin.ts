import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedData,
  PaginationParams,
} from "@/types/api";
import type { AppointmentSlotRecord, AppointmentSlotReadModel } from "@/types/models/slot";
import type {
  CreateAppointmentSlotInput,
  UpdateAppointmentSlotInput,
} from "@/schemas/slot";

export async function getSlotsAdmin(
  params: PaginationParams,
): Promise<PaginatedData<AppointmentSlotReadModel>> {
  const response = await api.get<PaginatedApiResponse<AppointmentSlotReadModel>>(
    "/admin/appointment-slots",
    { params },
  );
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function createSlot(
  data: CreateAppointmentSlotInput,
): Promise<AppointmentSlotRecord> {
  const response = await api.post<ApiResponse<AppointmentSlotRecord>>(
    "/admin/appointment-slots",
    data,
  );
  return response.data.data;
}

export async function updateSlot(
  id: string,
  data: UpdateAppointmentSlotInput,
): Promise<AppointmentSlotRecord> {
  const response = await api.patch<ApiResponse<AppointmentSlotRecord>>(
    `/admin/appointment-slots/${id}`,
    data,
  );
  return response.data.data;
}

export async function deleteSlot(id: string): Promise<void> {
  await api.delete(`/admin/appointment-slots/${id}`);
}
