import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { appointmentService } from "./appointment.service.js";

export class AppointmentController extends BaseController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointment = await appointmentService.create(req.body);
      this.created(res, appointment, "Appointment created successfully");
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointments = await appointmentService.findAll();
      this.ok(res, appointments);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointment = await appointmentService.findById(req.params.id as string);
      this.ok(res, appointment);
    } catch (error) {
      next(error);
    }
  };

  findByPatientId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointments = await appointmentService.findByPatientId(req.params.patientId as string);
      this.ok(res, appointments);
    } catch (error) {
      next(error);
    }
  };

  findByDoctorId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointments = await appointmentService.findByDoctorId(req.params.doctorId as string);
      this.ok(res, appointments);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointment = await appointmentService.update(req.params.id as string, req.body);
      this.ok(res, appointment, "Appointment updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await appointmentService.delete(req.params.id as string);
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const appointmentController = new AppointmentController();
