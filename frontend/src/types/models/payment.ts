import type { PaymentMethod, PaymentStatus } from "../enums";

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string | null;
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
