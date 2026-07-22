import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { paymentService } from "./payment.service.js";

export class PaymentController extends BaseController {
  createAsPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payment = await paymentService.createAsPatient(req.user!.sub, req.body);
      this.created(res, payment, "Payment created successfully");
    } catch (error) {
      next(error);
    }
  };

  findMyPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payments = await paymentService.findMyPayments(req.user!.sub);
      this.ok(res, payments);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payment = await paymentService.create(req.body);
      this.created(res, payment, "Payment created successfully");
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payments = await paymentService.findAll();
      this.ok(res, payments);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payment = await paymentService.findById(req.params.id as string);
      this.ok(res, payment);
    } catch (error) {
      next(error);
    }
  };

  findByAppointmentId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payment = await paymentService.findByAppointmentId(req.params.appointmentId as string);
      this.ok(res, payment);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payment = await paymentService.update(req.params.id as string, req.body);
      this.ok(res, payment, "Payment updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await paymentService.delete(req.params.id as string);
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const paymentController = new PaymentController();
