export interface CreateReviewDto {
  appointmentId: string;
  rating: number;
  comment?: string | null;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string | null;
}
