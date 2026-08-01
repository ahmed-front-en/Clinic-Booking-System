import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { PaymentRecord } from "@/types/models/payment";
import type { CreatePaymentInput } from "@/schemas/payment";

export async function getMyPayments(): Promise<PaymentRecord[]> {
  const response = await api.get<ApiResponse<PaymentRecord[]>>("/payments/mine");
  return response.data.data;
}

export async function createPayment(data: CreatePaymentInput): Promise<PaymentRecord> {
  const response = await api.post<ApiResponse<PaymentRecord>>("/payments", data);
  return response.data.data;
}
