export interface ReviewRecord {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
}

export interface CreateReviewRequest {
  appointmentId: string;
  rating: number;
  comment?: string | null;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string | null;
}
