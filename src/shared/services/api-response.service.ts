import type { Response } from "express";
import { HttpStatus, type HttpStatusCode } from "../constants/http-status.js";
import type { ApiResponseBody, PaginatedApiResponseBody } from "../types/api-response.types.js";
import type { PaginationMeta } from "../types/pagination.types.js";

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, statusCode: HttpStatusCode = HttpStatus.OK): void {
    const body: ApiResponseBody<T> = { success: true, data, ...(message && { message }) };
    res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message?: string): void {
    ApiResponse.success(res, data, message, HttpStatus.CREATED);
  }

  static paginated<T>(res: Response, data: T[], pagination: PaginationMeta, message?: string): void {
    const body: PaginatedApiResponseBody<T> = { success: true, data, pagination, ...(message && { message }) };
    res.status(HttpStatus.OK).json(body);
  }

  static error(res: Response, statusCode: HttpStatusCode, message: string, errors?: unknown[]): void {
    const body: ApiResponseBody<null> = { success: false, message, ...(errors && { errors }) };
    res.status(statusCode).json(body);
  }
}
