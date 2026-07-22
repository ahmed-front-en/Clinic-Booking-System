import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { patientService } from "./patient.service.js";

export class PatientController extends BaseController {
  findMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await patientService.findByUserId(req.user!.sub);
      this.ok(res, patient);
    } catch (error) {
      next(error);
    }
  };

  updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await patientService.updateMyProfile(req.user!.sub, req.body);
      this.ok(res, patient, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await patientService.create(req.body);
      this.created(res, patient, "Patient created successfully");
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patients = await patientService.findAll();
      this.ok(res, patients);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await patientService.findById(req.params.id as string);
      this.ok(res, patient);
    } catch (error) {
      next(error);
    }
  };

  findByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await patientService.findByUserId(req.params.userId as string);
      this.ok(res, patient);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await patientService.update(req.params.id as string, req.body);
      this.ok(res, patient, "Patient updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await patientService.delete(req.params.id as string);
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const patientController = new PatientController();
