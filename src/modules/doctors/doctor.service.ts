import { doctorRepository } from "./doctor.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { CreateDoctorDto, UpdateDoctorDto } from "./doctor.types.js";
import type { DoctorRecord } from "./doctor.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class DoctorService {
  async create(dto: CreateDoctorDto): Promise<DoctorRecord> {
    const user = await doctorRepository.findUserById(dto.userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    if (user.role !== "doctor") {
      throw new AppError(HttpStatus.BAD_REQUEST, "User is not a doctor");
    }

    const clinic = await doctorRepository.findClinicById(dto.clinicId);
    if (!clinic) {
      throw AppError.notFound("Clinic not found");
    }

    const specialty = await doctorRepository.findSpecialtyById(dto.specialtyId);
    if (!specialty) {
      throw AppError.notFound("Specialty not found");
    }

    const existingDoctor = await doctorRepository.findByUserId(dto.userId);
    if (existingDoctor) {
      throw new AppError(HttpStatus.CONFLICT, "Doctor already exists for this user");
    }

    return doctorRepository.create({
      userId: dto.userId,
      clinicId: dto.clinicId,
      specialtyId: dto.specialtyId,
      consultationFee: String(dto.consultationFee),
      bio: dto.bio ?? null,
      experienceYears: dto.experienceYears,
    });
  }

  async findAll(): Promise<DoctorRecord[]> {
    return doctorRepository.findAll();
  }

  async findById(id: UUID): Promise<DoctorRecord> {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) {
      throw AppError.notFound("Doctor not found");
    }
    return doctor;
  }

  async update(id: UUID, dto: UpdateDoctorDto): Promise<DoctorRecord> {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) {
      throw AppError.notFound("Doctor not found");
    }

    if (
      dto.clinicId === undefined &&
      dto.specialtyId === undefined &&
      dto.consultationFee === undefined &&
      dto.bio === undefined &&
      dto.experienceYears === undefined
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, "No fields provided for update");
    }

    if (dto.clinicId !== undefined && dto.clinicId !== doctor.clinicId) {
      const clinic = await doctorRepository.findClinicById(dto.clinicId);
      if (!clinic) {
        throw AppError.notFound("Clinic not found");
      }
    }

    if (dto.specialtyId !== undefined && dto.specialtyId !== doctor.specialtyId) {
      const specialty = await doctorRepository.findSpecialtyById(dto.specialtyId);
      if (!specialty) {
        throw AppError.notFound("Specialty not found");
      }
    }

    const updated = await doctorRepository.update(id, {
      clinicId: dto.clinicId,
      specialtyId: dto.specialtyId,
      consultationFee: dto.consultationFee !== undefined ? String(dto.consultationFee) : undefined,
      bio: dto.bio,
      experienceYears: dto.experienceYears,
    });
    if (!updated) {
      throw AppError.notFound("Doctor not found");
    }
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) {
      throw AppError.notFound("Doctor not found");
    }

    const deleted = await doctorRepository.delete(id);
    if (!deleted) {
      throw AppError.notFound("Doctor not found");
    }
  }
}

export const doctorService = new DoctorService();
