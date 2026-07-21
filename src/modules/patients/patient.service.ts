import { patientRepository } from "./patient.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { CreatePatientDto, UpdatePatientDto } from "./patient.types.js";
import type { PatientRecord } from "./patient.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class PatientService {
  async create(dto: CreatePatientDto): Promise<PatientRecord> {
    const user = await patientRepository.findUserById(dto.userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const existing = await patientRepository.existsForUser(dto.userId);
    if (existing) {
      throw new AppError(HttpStatus.CONFLICT, "A patient already exists for this user");
    }

    return patientRepository.create({
      userId: dto.userId,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      gender: dto.gender ?? null,
      birthDate: dto.birthDate ?? null,
    });
  }

  async findAll(): Promise<PatientRecord[]> {
    return patientRepository.findAll();
  }

  async findById(id: UUID): Promise<PatientRecord> {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw AppError.notFound("Patient not found");
    }
    return patient;
  }

  async findByUserId(userId: UUID): Promise<PatientRecord> {
    const user = await patientRepository.findUserById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw AppError.notFound("Patient not found for this user");
    }
    return patient;
  }

  async update(id: UUID, dto: UpdatePatientDto): Promise<PatientRecord> {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw AppError.notFound("Patient not found");
    }

    if (
      dto.fullName === undefined &&
      dto.phone === undefined &&
      dto.gender === undefined &&
      dto.birthDate === undefined
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, "No fields provided for update");
    }

    const updated = await patientRepository.update(id, {
      fullName: dto.fullName,
      phone: dto.phone,
      gender: dto.gender,
      birthDate: dto.birthDate,
    });
    if (!updated) {
      throw AppError.notFound("Patient not found");
    }
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw AppError.notFound("Patient not found");
    }

    await patientRepository.delete(id);
  }
}

export const patientService = new PatientService();
