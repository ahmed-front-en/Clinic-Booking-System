import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { HttpStatus } from "../constants/http-status.js";
import { ApiResponse } from "../services/api-response.service.js";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError && err.isOperational) {
    ApiResponse.error(res, err.statusCode, err.message, err.details as unknown[] | undefined);
    return;
  }

  console.error("Unhandled error:", err);
  ApiResponse.error(res, HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
}
