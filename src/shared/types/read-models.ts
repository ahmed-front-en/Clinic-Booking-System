import type { UUID } from "./common.types.js";

export interface PatientSummary {
  id: UUID;
  fullName: string;
}

export interface DoctorSummary {
  id: UUID;
  displayName: string;
  clinicName: string;
  specialtyName: string;
}

export interface SlotSummary {
  id: UUID;
  date: string;
  startTime: string;
  endTime: string;
}
