export interface CreatePaymentDto {
  appointmentId: string;
  amount: number;
  method: string;
  status?: string;
  transactionReference?: string | null;
}

export interface UpdatePaymentDto {
  amount?: number;
  method?: string;
  status?: string;
  transactionReference?: string | null;
}
