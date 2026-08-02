import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AppointmentRecord, AppointmentReadModel } from "@/types/models/appointment";

export async function getMyAppointments(): Promise<AppointmentReadModel[]> {
  const response = await api.get<ApiResponse<AppointmentReadModel[]>>("/appointments/mine");
  return response.data.data;
}

export async function bookAppointment(slotId: string): Promise<AppointmentRecord> {
  const response = await api.post<ApiResponse<AppointmentRecord>>("/appointments", {
    slotId,
  });
  return response.data.data;
}

export async function cancelMyAppointment(id: string): Promise<AppointmentRecord> {
  const response = await api.patch<ApiResponse<AppointmentRecord>>(
    `/appointments/mine/${id}`,
  );
  return response.data.data;
}
