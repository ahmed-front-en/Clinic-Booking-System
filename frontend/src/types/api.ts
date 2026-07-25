export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  code: string;
  expected?: number;
  received?: number;
  path: string[];
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
