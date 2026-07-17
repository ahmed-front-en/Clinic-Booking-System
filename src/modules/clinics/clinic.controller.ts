import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { clinicService } from "./clinic.service.js";

export class ClinicController extends BaseController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clinic = await clinicService.create(req.body);
      this.created(res, clinic, "Clinic created successfully");
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clinics = await clinicService.findAll();
      this.ok(res, clinics);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clinic = await clinicService.findById(req.params.id as string);
      this.ok(res, clinic);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clinic = await clinicService.update(req.params.id as string, req.body);
      this.ok(res, clinic, "Clinic updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await clinicService.delete(req.params.id as string);
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const clinicController = new ClinicController();
