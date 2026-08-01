import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedData,
  PaginationParams,
} from "@/types/api";
import type { DoctorScheduleRecord } from "@/types/models/schedule";
import type {
  CreateDoctorScheduleInput,
  UpdateDoctorScheduleInput,
} from "@/schemas/schedule";

export async function getSchedulesAdmin(
  params: PaginationParams,
): Promise<PaginatedData<DoctorScheduleRecord>> {
  const response = await api.get<PaginatedApiResponse<DoctorScheduleRecord>>(
    "/doctor-schedules",
    { params },
  );
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function createSchedule(
  data: CreateDoctorScheduleInput,
): Promise<DoctorScheduleRecord> {
  const response = await api.post<ApiResponse<DoctorScheduleRecord>>(
    "/doctor-schedules",
    data,
  );
  return response.data.data;
}

export async function updateSchedule(
  id: string,
  data: UpdateDoctorScheduleInput,
): Promise<DoctorScheduleRecord> {
  const response = await api.patch<ApiResponse<DoctorScheduleRecord>>(
    `/doctor-schedules/${id}`,
    data,
  );
  return response.data.data;
}

export async function deleteSchedule(id: string): Promise<void> {
  await api.delete(`/doctor-schedules/${id}`);
}
