import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiResponse } from "../services/api-response.service.js";
import { HttpStatus } from "../constants/http-status.js";

export function validate<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      ApiResponse.error(res, HttpStatus.BAD_REQUEST, "Validation failed", result.error.issues);
      return;
    }

    req.body = result.data;
    next();
  };
}
