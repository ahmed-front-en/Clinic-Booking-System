import { doctorScheduleRepository } from "./doctor-schedule.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { CreateDoctorScheduleDto, UpdateDoctorScheduleDto } from "./doctor-schedule.types.js";
import type { DoctorScheduleRecord } from "./doctor-schedule.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class DoctorScheduleService {
  async findMySchedule(userId: UUID): Promise<DoctorScheduleRecord[]> {
    const doctor = await doctorScheduleRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw AppError.notFound("Doctor profile not found");
    }
    return doctorScheduleRepository.findByDoctorId(doctor.id);
  }

  async create(dto: CreateDoctorScheduleDto): Promise<DoctorScheduleRecord> {
    const doctor = await doctorScheduleRepository.findDoctorById(dto.doctorId);
    if (!doctor) {
      throw AppError.notFound("Doctor not found");
    }

    const duplicate = await doctorScheduleRepository.findDuplicate(
      dto.doctorId,
      dto.weekday,
      dto.startTime,
    );
    if (duplicate) {
      throw new AppError(HttpStatus.CONFLICT, "Schedule already exists for this doctor on this weekday and start time");
    }

    return doctorScheduleRepository.create({
      doctorId: dto.doctorId,
      weekday: dto.weekday,
      startTime: dto.startTime,
      endTime: dto.endTime,
      slotDuration: dto.slotDuration,
    });
  }

  async findAll(): Promise<DoctorScheduleRecord[]> {
    return doctorScheduleRepository.findAll();
  }

  async findById(id: UUID): Promise<DoctorScheduleRecord> {
    const schedule = await doctorScheduleRepository.findById(id);
    if (!schedule) {
      throw AppError.notFound("Schedule not found");
    }
    return schedule;
  }

  async findByDoctorId(doctorId: UUID): Promise<DoctorScheduleRecord[]> {
    const doctor = await doctorScheduleRepository.findDoctorById(doctorId);
    if (!doctor) {
      throw AppError.notFound("Doctor not found");
    }
    return doctorScheduleRepository.findByDoctorId(doctorId);
  }

  async update(id: UUID, dto: UpdateDoctorScheduleDto): Promise<DoctorScheduleRecord> {
    const schedule = await doctorScheduleRepository.findById(id);
    if (!schedule) {
      throw AppError.notFound("Schedule not found");
    }

    if (
      dto.weekday === undefined &&
      dto.startTime === undefined &&
      dto.endTime === undefined &&
      dto.slotDuration === undefined
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, "No fields provided for update");
    }

    if (dto.startTime !== undefined || dto.weekday !== undefined) {
      const checkWeekday = dto.weekday ?? schedule.weekday;
      const checkStartTime = dto.startTime ?? schedule.startTime;

      const existing = await doctorScheduleRepository.findDuplicate(
        schedule.doctorId,
        checkWeekday,
        checkStartTime,
      );
      if (existing && existing.id !== id) {
        throw new AppError(HttpStatus.CONFLICT, "Schedule already exists for this doctor on this weekday and start time");
      }
    }

    const updated = await doctorScheduleRepository.update(id, {
      weekday: dto.weekday,
      startTime: dto.startTime,
      endTime: dto.endTime,
      slotDuration: dto.slotDuration,
    });
    if (!updated) {
      throw AppError.notFound("Schedule not found");
    }
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    const schedule = await doctorScheduleRepository.findById(id);
    if (!schedule) {
      throw AppError.notFound("Schedule not found");
    }

    const deleted = await doctorScheduleRepository.delete(id);
    if (!deleted) {
      throw AppError.notFound("Schedule not found");
    }
  }
}

export const doctorScheduleService = new DoctorScheduleService();
