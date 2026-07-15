import type { Response } from "express";
import { ApiResponse } from "../services/api-response.service.js";
import type { PaginationMeta } from "../types/pagination.types.js";

export abstract class BaseController {
  protected ok<T>(res: Response, data: T, message?: string): void {
    ApiResponse.success(res, data, message);
  }

  protected created<T>(res: Response, data: T, message?: string): void {
    ApiResponse.created(res, data, message);
  }

  protected noContent(res: Response): void {
    res.status(204).send();
  }

  protected paginated<T>(res: Response, data: T[], pagination: PaginationMeta, message?: string): void {
    ApiResponse.paginated(res, data, pagination, message);
  }
}
