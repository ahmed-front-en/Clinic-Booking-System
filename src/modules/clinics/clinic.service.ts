import { clinicRepository } from "./clinic.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { CreateClinicDto, UpdateClinicDto } from "./clinic.types.js";
import type { ClinicRecord } from "./clinic.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class ClinicService {
  async create(dto: CreateClinicDto): Promise<ClinicRecord> {
    return clinicRepository.create({
      name: dto.name,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      city: dto.city ?? null,
      description: dto.description ?? null,
    });
  }

  async findAll(): Promise<ClinicRecord[]> {
    return clinicRepository.findAll();
  }

  async findById(id: UUID): Promise<ClinicRecord> {
    const clinic = await clinicRepository.findById(id);
    if (!clinic) {
      throw AppError.notFound("Clinic not found");
    }
    return clinic;
  }

  async update(id: UUID, dto: UpdateClinicDto): Promise<ClinicRecord> {
    const clinic = await clinicRepository.findById(id);
    if (!clinic) {
      throw AppError.notFound("Clinic not found");
    }

    const updated = await clinicRepository.update(id, dto);
    if (!updated) {
      throw AppError.notFound("Clinic not found");
    }
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    const clinic = await clinicRepository.findById(id);
    if (!clinic) {
      throw AppError.notFound("Clinic not found");
    }

    const deleted = await clinicRepository.delete(id);
    if (!deleted) {
      throw AppError.notFound("Clinic not found");
    }
  }
}

export const clinicService = new ClinicService();
