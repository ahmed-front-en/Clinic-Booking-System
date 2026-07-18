import { appointmentRepository } from "./appointment.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { CreateAppointmentDto, UpdateAppointmentDto } from "./appointment.types.js";
import type { AppointmentRecord } from "./appointment.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class AppointmentService {
  async create(dto: CreateAppointmentDto): Promise<AppointmentRecord> {
    const patient = await appointmentRepository.findPatientById(dto.patientId);
    if (!patient) {
      throw AppError.notFound("Patient not found");
    }

    const slot = await appointmentRepository.findSlotById(dto.slotId);
    if (!slot) {
      throw AppError.notFound("Appointment slot not found");
    }

    if (slot.deletedAt) {
      throw AppError.notFound("Appointment slot not found");
    }

    if (slot.status !== "available") {
      throw new AppError(HttpStatus.CONFLICT, "Appointment slot is not available");
    }

    const existing = await appointmentRepository.existsForSlot(dto.slotId);
    if (existing) {
      throw new AppError(HttpStatus.CONFLICT, "An appointment already exists for this slot");
    }

    return appointmentRepository.transaction(async () => {
      const appointment = await appointmentRepository.create({
        patientId: dto.patientId,
        slotId: dto.slotId,
        status: dto.status ?? "scheduled",
        notes: dto.notes ?? null,
      });

      await appointmentRepository.updateSlotStatus(dto.slotId, "booked");

      return appointment;
    });
  }

  async findAll(): Promise<AppointmentRecord[]> {
    return appointmentRepository.findAll();
  }

  async findById(id: UUID): Promise<AppointmentRecord> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw AppError.notFound("Appointment not found");
    }
    return appointment;
  }

  async findByPatientId(patientId: UUID): Promise<AppointmentRecord[]> {
    const patient = await appointmentRepository.findPatientById(patientId);
    if (!patient) {
      throw AppError.notFound("Patient not found");
    }
    return appointmentRepository.findByPatientId(patientId);
  }

  async findByDoctorId(doctorId: UUID): Promise<AppointmentRecord[]> {
    return appointmentRepository.findByDoctorId(doctorId);
  }

  async update(id: UUID, dto: UpdateAppointmentDto): Promise<AppointmentRecord> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw AppError.notFound("Appointment not found");
    }

    if (dto.status === undefined && dto.notes === undefined) {
      throw new AppError(HttpStatus.BAD_REQUEST, "No fields provided for update");
    }

    return appointmentRepository.transaction(async () => {
      if (dto.status !== undefined) {
        if (dto.status === "cancelled") {
          await appointmentRepository.updateSlotStatus(appointment.slotId, "available");
        }
      }

      const updated = await appointmentRepository.update(id, {
        status: dto.status,
        notes: dto.notes,
      });
      if (!updated) {
        throw AppError.notFound("Appointment not found");
      }

      return updated;
    });
  }

  async delete(id: UUID): Promise<void> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw AppError.notFound("Appointment not found");
    }

    await appointmentRepository.transaction(async () => {
      await appointmentRepository.delete(id);
      await appointmentRepository.updateSlotStatus(appointment.slotId, "available");
    });
  }

}

export const appointmentService = new AppointmentService();
