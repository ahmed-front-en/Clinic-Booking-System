import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { HttpStatus } from "../constants/http-status.js";
import { ApiResponse } from "../services/api-response.service.js";

interface PostgresError extends Error {
  code?: string;
  severity?: string;
  detail?: string;
  hint?: string;
  position?: string;
  schema?: string;
  table?: string;
  column?: string;
  routine?: string;
  file?: string;
  line?: string;
}

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

  const pgErr = err as PostgresError;
  if (pgErr.code === "22P02") {
    ApiResponse.error(res, HttpStatus.BAD_REQUEST, "Invalid input format");
    return;
  }

  ApiResponse.error(res, HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
}
