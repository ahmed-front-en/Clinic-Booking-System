import type { AppointmentStatus } from "../enums";

export interface AppointmentRecord {
  id: string;
  patientId: string;
  slotId: string;
  status: AppointmentStatus;
  notes: string | null;
}

export interface AppointmentCreateRequest {
  slotId: string;
}

export interface AppointmentUpdateRequest {
  status?: AppointmentStatus;
  notes?: string | null;
}
