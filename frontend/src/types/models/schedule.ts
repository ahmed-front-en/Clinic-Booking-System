export interface DoctorScheduleRecord {
  id: string;
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface DoctorScheduleCreateRequest {
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface DoctorScheduleUpdateRequest {
  doctorId?: string;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
}
