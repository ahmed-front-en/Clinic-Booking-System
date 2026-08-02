import type { UUID } from "../../shared/types/common.types.js";
import type { PatientSummary, DoctorSummary, SlotSummary } from "../../shared/types/read-models.js";

export interface PaymentRecord {
  id: UUID;
  appointmentId: UUID;
  amount: number;
  method: string;
  status: string;
  transactionReference: string | null;
}

export interface PaymentReadModel extends PaymentRecord {
  patient: PatientSummary;
  slot: SlotSummary;
  doctor: DoctorSummary;
}
