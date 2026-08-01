import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AppointmentSlotRecord } from "@/types/models/slot";

export async function getAvailableSlots(params?: {
  doctorId?: string;
  date?: string;
}): Promise<AppointmentSlotRecord[]> {
  const response = await api.get<ApiResponse<AppointmentSlotRecord[]>>(
    "/appointment-slots/available",
    { params },
  );
  return response.data.data;
}
