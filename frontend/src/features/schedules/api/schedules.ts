import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DoctorScheduleRecord } from "@/types/models/schedule";

export async function getMySchedule(): Promise<DoctorScheduleRecord[]> {
  const response = await api.get<ApiResponse<DoctorScheduleRecord[]>>(
    "/doctor-schedules/me",
  );
  return response.data.data;
}
