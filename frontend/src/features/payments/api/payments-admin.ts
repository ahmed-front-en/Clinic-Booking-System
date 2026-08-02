import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedData,
  PaginationParams,
} from "@/types/api";
import type { PaymentRecord, PaymentReadModel } from "@/types/models/payment";
import type { UpdatePaymentInput } from "@/schemas/payment";

export async function getPaymentsAdmin(
  params: PaginationParams,
): Promise<PaginatedData<PaymentReadModel>> {
  const response = await api.get<PaginatedApiResponse<PaymentReadModel>>("/payments", {
    params,
  });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function updatePayment(
  id: string,
  data: UpdatePaymentInput,
): Promise<PaymentRecord> {
  const response = await api.patch<ApiResponse<PaymentRecord>>(`/payments/${id}`, data);
  return response.data.data;
}

export async function deletePayment(id: string): Promise<void> {
  await api.delete(`/payments/${id}`);
}
