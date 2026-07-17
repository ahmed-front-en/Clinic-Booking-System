export interface CreateDoctorScheduleDto {
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface UpdateDoctorScheduleDto {
  weekday?: number;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
}
