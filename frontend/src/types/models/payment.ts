import type { PaymentMethod, PaymentStatus } from "../enums";

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string | null;
}

export interface CreatePaymentRequest {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  transactionReference?: string | null;
}

export interface UpdatePaymentRequest {
  appointmentId?: string;
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  transactionReference?: string | null;
}
