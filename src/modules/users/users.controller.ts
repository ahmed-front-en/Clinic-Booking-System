import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { usersService } from "./users.service.js";

export class UsersController extends BaseController {
  findAll = (req: Request, res: Response, next: NextFunction): void => {
    throw new Error("Not implemented");
  };

  findById = (req: Request, res: Response, next: NextFunction): void => {
    throw new Error("Not implemented");
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    throw new Error("Not implemented");
  };

  softDelete = (req: Request, res: Response, next: NextFunction): void => {
    throw new Error("Not implemented");
  };
}

export const usersController = new UsersController();
