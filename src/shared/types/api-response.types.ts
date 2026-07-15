import type { PaginationMeta } from "./pagination.types.js";

export interface ApiResponseBody<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown[];
}

export interface PaginatedApiResponseBody<T> extends Omit<ApiResponseBody<T[]>, "data"> {
  data: T[];
  pagination: PaginationMeta;
}
