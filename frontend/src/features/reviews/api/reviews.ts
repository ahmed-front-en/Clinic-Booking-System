import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ReviewRecord, ReviewReadModel } from "@/types/models/review";
import type { CreateReviewInput } from "@/schemas/review";

export async function getMyReviews(): Promise<ReviewReadModel[]> {
  const response = await api.get<ApiResponse<ReviewReadModel[]>>("/reviews/mine");
  return response.data.data;
}

export async function createReview(data: CreateReviewInput): Promise<ReviewRecord> {
  const response = await api.post<ApiResponse<ReviewRecord>>("/reviews", data);
  return response.data.data;
}
