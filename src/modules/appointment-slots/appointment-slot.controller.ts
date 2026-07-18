import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { appointmentSlotService } from "./appointment-slot.service.js";

export class AppointmentSlotController extends BaseController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slot = await appointmentSlotService.create(req.body);
      this.created(res, slot, "Appointment slot created successfully");
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slots = await appointmentSlotService.findAll();
      this.ok(res, slots);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slot = await appointmentSlotService.findById(req.params.id as string);
      this.ok(res, slot);
    } catch (error) {
      next(error);
    }
  };

  findByDoctorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slots = await appointmentSlotService.findByDoctorId(req.params.doctorId as string);
      this.ok(res, slots);
    } catch (error) {
      next(error);
    }
  };

  findByDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slots = await appointmentSlotService.findByDate(req.params.slotDate as string);
      this.ok(res, slots);
    } catch (error) {
      next(error);
    }
  };

  findAvailable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slots = await appointmentSlotService.findAvailable({
        doctorId: req.query.doctorId as string | undefined,
        date: req.query.date as string | undefined,
        available: req.query.available as string | undefined,
      });
      this.ok(res, slots);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slot = await appointmentSlotService.update(req.params.id as string, req.body);
      this.ok(res, slot, "Appointment slot updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await appointmentSlotService.delete(req.params.id as string);
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const appointmentSlotController = new AppointmentSlotController();
