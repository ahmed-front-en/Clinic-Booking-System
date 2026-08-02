import type { DoctorSummary } from "./read-models";

export interface DoctorScheduleRecord {
  id: string;
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface DoctorScheduleReadModel extends DoctorScheduleRecord {
  doctor: DoctorSummary;
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
