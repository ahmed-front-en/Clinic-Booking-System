import type { UUID } from "../../shared/types/common.types.js";
import type { PatientSummary, DoctorSummary, SlotSummary } from "../../shared/types/read-models.js";

export interface ReviewRecord {
  id: UUID;
  appointmentId: UUID;
  rating: number;
  comment: string | null;
}

export interface ReviewReadModel extends ReviewRecord {
  patient: PatientSummary;
  slot: SlotSummary;
  doctor: DoctorSummary;
}
