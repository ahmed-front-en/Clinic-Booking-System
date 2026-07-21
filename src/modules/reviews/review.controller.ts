import type { Request, Response, NextFunction } from "express";
import { BaseController } from "../../shared/controllers/base.controller.js";
import { reviewService } from "./review.service.js";

export class ReviewController extends BaseController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await reviewService.create(req.body);
      this.created(res, review, "Review created successfully");
    } catch (error) {
      next(error);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviews = await reviewService.findAll();
      this.ok(res, reviews);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await reviewService.findById(req.params.id as string);
      this.ok(res, review);
    } catch (error) {
      next(error);
    }
  };

  findByAppointmentId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await reviewService.findByAppointmentId(req.params.appointmentId as string);
      this.ok(res, review);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const review = await reviewService.update(req.params.id as string, req.body);
      this.ok(res, review, "Review updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await reviewService.delete(req.params.id as string);
      this.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

export const reviewController = new ReviewController();
