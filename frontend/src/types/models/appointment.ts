import type { AppointmentStatus } from "../enums";

export interface AppointmentRecord {
  id: string;
  patientId: string;
  slotId: string;
  status: AppointmentStatus;
  notes: string | null;
}

export interface CreateAppointmentRequest {
  slotId: string;
}

export interface UpdateAppointmentRequest {
  status?: AppointmentStatus;
  notes?: string | null;
}
