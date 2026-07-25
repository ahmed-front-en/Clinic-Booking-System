export interface ReviewRecord {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
}

export interface ReviewCreateRequest {
  appointmentId: string;
  rating: number;
  comment?: string | null;
}

export interface ReviewUpdateRequest {
  rating?: number;
  comment?: string | null;
}
