import type { UUID } from "../../shared/types/common.types.js";

export interface PaymentRecord {
  id: UUID;
  appointmentId: UUID;
  amount: number;
  method: string;
  status: string;
  transactionReference: string | null;
}
