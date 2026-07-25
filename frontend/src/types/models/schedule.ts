export interface DoctorScheduleRecord {
  id: string;
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface CreateDoctorScheduleRequest {
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface UpdateDoctorScheduleRequest {
  doctorId?: string;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
}
