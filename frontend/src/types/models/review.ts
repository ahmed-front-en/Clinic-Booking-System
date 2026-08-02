import type {
  PatientSummary,
  SlotSummary,
  DoctorSummary,
} from "./read-models";

export interface ReviewRecord {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
}

export interface ReviewReadModel extends ReviewRecord {
  patient: PatientSummary;
  slot: SlotSummary;
  doctor: DoctorSummary;
}

export interface ReviewCreateRequest {
  appointmentId: string;
  rating: number;
  comment?: string | null;
}

export interface ReviewUpdateRequest {
  rating?: number;
  comment?: string | null;
}
