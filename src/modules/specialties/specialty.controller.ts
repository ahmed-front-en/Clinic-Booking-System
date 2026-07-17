import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { specialtyService } from "./specialty.service.js";

export class SpecialtyController extends BaseController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const specialty = await specialtyService.create(req.body);
      this.created(res, specialty, "Specialty created successfully");
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const specialties = await specialtyService.findAll();
      this.ok(res, specialties);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const specialty = await specialtyService.findById(req.params.id as string);
      this.ok(res, specialty);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const specialty = await specialtyService.update(req.params.id as string, req.body);
      this.ok(res, specialty, "Specialty updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await specialtyService.delete(req.params.id as string);
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const specialtyController = new SpecialtyController();
