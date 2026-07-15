import { HttpStatus, type HttpStatusCode } from "../constants/http-status.js";

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode: HttpStatusCode,
    message: string,
    options?: { isOperational?: boolean; details?: unknown },
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(HttpStatus.BAD_REQUEST, message, { details });
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(HttpStatus.FORBIDDEN, message);
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(HttpStatus.NOT_FOUND, message);
  }

  static conflict(message: string): AppError {
    return new AppError(HttpStatus.CONFLICT, message);
  }

  static unprocessable(message: string, details?: unknown): AppError {
    return new AppError(HttpStatus.UNPROCESSABLE_ENTITY, message, { details });
  }
}
