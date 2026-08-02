import type { AppointmentStatus } from "../enums";
import type {
  PatientSummary,
  SlotSummary,
  DoctorSummary,
} from "./read-models";

export interface AppointmentRecord {
  id: string;
  patientId: string;
  slotId: string;
  status: AppointmentStatus;
  notes: string | null;
}

export interface AppointmentReadModel extends AppointmentRecord {
  patient: PatientSummary;
  slot: SlotSummary;
  doctor: DoctorSummary;
}

export interface AppointmentCreateRequest {
  slotId: string;
}

export interface AppointmentUpdateRequest {
  status?: AppointmentStatus;
  notes?: string | null;
}
