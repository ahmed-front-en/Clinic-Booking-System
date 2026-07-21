import { reviewRepository } from "./review.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { CreateReviewDto, UpdateReviewDto } from "./review.types.js";
import type { ReviewRecord } from "./review.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class ReviewService {
  async create(dto: CreateReviewDto): Promise<ReviewRecord> {
    const appointment = await reviewRepository.findAppointmentById(dto.appointmentId);
    if (!appointment) {
      throw AppError.notFound("Appointment not found");
    }

    const existing = await reviewRepository.existsForAppointment(dto.appointmentId);
    if (existing) {
      throw new AppError(HttpStatus.CONFLICT, "A review already exists for this appointment");
    }

    return reviewRepository.create({
      appointmentId: dto.appointmentId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
  }

  async findAll(): Promise<ReviewRecord[]> {
    return reviewRepository.findAll();
  }

  async findById(id: UUID): Promise<ReviewRecord> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw AppError.notFound("Review not found");
    }
    return review;
  }

  async findByAppointmentId(appointmentId: UUID): Promise<ReviewRecord> {
    const appointment = await reviewRepository.findAppointmentById(appointmentId);
    if (!appointment) {
      throw AppError.notFound("Appointment not found");
    }

    const review = await reviewRepository.findByAppointmentId(appointmentId);
    if (!review) {
      throw AppError.notFound("Review not found for this appointment");
    }
    return review;
  }

  async update(id: UUID, dto: UpdateReviewDto): Promise<ReviewRecord> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw AppError.notFound("Review not found");
    }

    if (
      dto.rating === undefined &&
      dto.comment === undefined
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, "No fields provided for update");
    }

    const updated = await reviewRepository.update(id, {
      rating: dto.rating,
      comment: dto.comment,
    });
    if (!updated) {
      throw AppError.notFound("Review not found");
    }
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw AppError.notFound("Review not found");
    }

    await reviewRepository.delete(id);
  }
}

export const reviewService = new ReviewService();
