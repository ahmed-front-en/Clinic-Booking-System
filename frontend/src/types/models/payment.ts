import type { PaymentMethod, PaymentStatus } from "../enums";
import type {
  PatientSummary,
  SlotSummary,
  DoctorSummary,
} from "./read-models";

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string | null;
}

export interface PaymentReadModel extends PaymentRecord {
  patient: PatientSummary;
  slot: SlotSummary;
  doctor: DoctorSummary;
}

export interface PaymentCreateRequest {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  transactionReference?: string | null;
}

export interface PaymentUpdateRequest {
  appointmentId?: string;
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  transactionReference?: string | null;
}
