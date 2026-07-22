import { appointmentSlotRepository } from "./appointment-slot.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { CreateAppointmentSlotDto, UpdateAppointmentSlotDto, AppointmentSlotQueryParams } from "./appointment-slot.types.js";
import type { AppointmentSlotRecord } from "./appointment-slot.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class AppointmentSlotService {
  async create(dto: CreateAppointmentSlotDto): Promise<AppointmentSlotRecord> {
    const doctor = await appointmentSlotRepository.findDoctorById(dto.doctorId);
    if (!doctor) {
      throw AppError.notFound("Doctor not found");
    }

    const schedule = await appointmentSlotRepository.findDoctorScheduleById(dto.doctorScheduleId);
    if (!schedule) {
      throw AppError.notFound("Doctor schedule not found");
    }

    const duplicate = await appointmentSlotRepository.findDuplicate(
      dto.doctorId,
      dto.slotDate,
      dto.startTime,
    );
    if (duplicate) {
      throw new AppError(HttpStatus.CONFLICT, "Appointment slot already exists for this doctor on this date and start time");
    }

    const overlapping = await appointmentSlotRepository.findOverlapping(
      dto.doctorId,
      dto.slotDate,
      dto.startTime,
      dto.endTime,
    );
    if (overlapping) {
      throw new AppError(HttpStatus.CONFLICT, "Appointment slot overlaps with an existing slot");
    }

    return appointmentSlotRepository.create({
      doctorId: dto.doctorId,
      doctorScheduleId: dto.doctorScheduleId,
      slotDate: dto.slotDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: dto.status,
    });
  }

  async findAll(): Promise<AppointmentSlotRecord[]> {
    return appointmentSlotRepository.findAll();
  }

  async findById(id: UUID): Promise<AppointmentSlotRecord> {
    const slot = await appointmentSlotRepository.findById(id);
    if (!slot) {
      throw AppError.notFound("Appointment slot not found");
    }
    return slot;
  }

  async findByDoctorId(doctorId: UUID): Promise<AppointmentSlotRecord[]> {
    const doctor = await appointmentSlotRepository.findDoctorById(doctorId);
    if (!doctor) {
      throw AppError.notFound("Doctor not found");
    }
    return appointmentSlotRepository.findByDoctorId(doctorId);
  }

  async findByDate(slotDate: string): Promise<AppointmentSlotRecord[]> {
    return appointmentSlotRepository.findByDate(slotDate);
  }

  async findAvailable(query: AppointmentSlotQueryParams): Promise<AppointmentSlotRecord[]> {
    const filters: { doctorId?: UUID; date?: string } = {};

    if (query.doctorId) {
      const doctor = await appointmentSlotRepository.findDoctorById(query.doctorId);
      if (!doctor) {
        throw AppError.notFound("Doctor not found");
      }
      filters.doctorId = query.doctorId;
    }
    if (query.date) {
      filters.date = query.date;
    }

    return appointmentSlotRepository.findAvailable(filters);
  }

  async update(id: UUID, dto: UpdateAppointmentSlotDto): Promise<AppointmentSlotRecord> {
    const slot = await appointmentSlotRepository.findById(id);
    if (!slot) {
      throw AppError.notFound("Appointment slot not found");
    }

    if (
      dto.slotDate === undefined &&
      dto.startTime === undefined &&
      dto.endTime === undefined &&
      dto.status === undefined
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, "No fields provided for update");
    }

    if (dto.startTime !== undefined || dto.slotDate !== undefined || dto.endTime !== undefined) {
      const checkDate = dto.slotDate ?? slot.slotDate;
      const checkStartTime = dto.startTime ?? slot.startTime;
      const checkEndTime = dto.endTime ?? slot.endTime;

      const existing = await appointmentSlotRepository.findDuplicate(
        slot.doctorId,
        checkDate,
        checkStartTime,
      );
      if (existing && existing.id !== id) {
        throw new AppError(HttpStatus.CONFLICT, "Appointment slot already exists for this doctor on this date and start time");
      }

      const overlapping = await appointmentSlotRepository.findOverlapping(
        slot.doctorId,
        checkDate,
        checkStartTime,
        checkEndTime,
        id,
      );
      if (overlapping) {
        throw new AppError(HttpStatus.CONFLICT, "Appointment slot overlaps with an existing slot");
      }
    }

    const updated = await appointmentSlotRepository.update(id, {
      slotDate: dto.slotDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: dto.status,
    });
    if (!updated) {
      throw AppError.notFound("Appointment slot not found");
    }
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    const slot = await appointmentSlotRepository.findById(id);
    if (!slot) {
      throw AppError.notFound("Appointment slot not found");
    }

    await appointmentSlotRepository.delete(id);
  }
}

export const appointmentSlotService = new AppointmentSlotService();
