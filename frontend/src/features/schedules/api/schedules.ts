import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DoctorScheduleReadModel } from "@/types/models/schedule";

export async function getMySchedule(): Promise<DoctorScheduleReadModel[]> {
  const response = await api.get<ApiResponse<DoctorScheduleReadModel[]>>(
    "/doctor-schedules/me",
  );
  return response.data.data;
}
