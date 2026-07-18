export interface CreateAppointmentSlotDto {
  doctorId: string;
  doctorScheduleId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status?: string;
}

export interface UpdateAppointmentSlotDto {
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

export interface AppointmentSlotQueryParams {
  doctorId?: string;
  date?: string;
  available?: string;
}
