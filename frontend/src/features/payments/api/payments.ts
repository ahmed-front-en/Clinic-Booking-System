import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { PaymentRecord, PaymentReadModel } from "@/types/models/payment";
import type { CreatePaymentInput, UpdatePaymentInput } from "@/schemas/payment";

export async function getMyPayments(): Promise<PaymentReadModel[]> {
  const response = await api.get<ApiResponse<PaymentReadModel[]>>("/payments/mine");
  return response.data.data;
}

export async function createPayment(data: CreatePaymentInput): Promise<PaymentRecord> {
  const response = await api.post<ApiResponse<PaymentRecord>>("/payments", data);
  return response.data.data;
}

export async function updateMyPayment(
  id: string,
  data: UpdatePaymentInput,
): Promise<PaymentRecord> {
  const response = await api.patch<ApiResponse<PaymentRecord>>(`/payments/mine/${id}`, data);
  return response.data.data;
}
