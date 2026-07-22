import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { usersService } from "./users.service.js";

export class UsersController extends BaseController {
  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await usersService.findAll(_req.query as any);
      this.ok(res, users);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await usersService.findById(req.params.id as string);
      this.ok(res, user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await usersService.update(req.params.id as string, req.body);
      this.ok(res, user, "User updated successfully");
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await usersService.softDelete(req.params.id as string);
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
