import type { SlotStatus } from "../enums";

export interface AppointmentSlotRecord {
  id: string;
  doctorId: string;
  doctorScheduleId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateAppointmentSlotRequest {
  doctorId: string;
  doctorScheduleId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status?: SlotStatus;
}

export interface UpdateAppointmentSlotRequest {
  doctorId?: string;
  doctorScheduleId?: string;
  slotDate?: string;
  startTime?: string;
  endTime?: string;
  status?: SlotStatus;
}

export interface AvailableSlotsParams {
  doctorId?: string;
  date?: string;
  available?: string;
}
