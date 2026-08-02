import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AppointmentSlotReadModel } from "@/types/models/slot";

export async function getAvailableSlots(params?: {
  doctorId?: string;
  date?: string;
}): Promise<AppointmentSlotReadModel[]> {
  const response = await api.get<ApiResponse<AppointmentSlotReadModel[]>>(
    "/appointment-slots/available",
    { params },
  );
  return response.data.data;
}
