import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginatedData,
  PaginationParams,
} from "@/types/api";
import type { ReviewRecord } from "@/types/models/review";
import type { UpdateReviewInput } from "@/schemas/review";

export async function getReviewsAdmin(
  params: PaginationParams,
): Promise<PaginatedData<ReviewRecord>> {
  const response = await api.get<PaginatedApiResponse<ReviewRecord>>("/reviews", {
    params,
  });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function updateReview(
  id: string,
  data: UpdateReviewInput,
): Promise<ReviewRecord> {
  const response = await api.patch<ApiResponse<ReviewRecord>>(`/reviews/${id}`, data);
  return response.data.data;
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/reviews/${id}`);
}
