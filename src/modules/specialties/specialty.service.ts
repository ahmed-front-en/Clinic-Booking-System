import { specialtyRepository } from "./specialty.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { CreateSpecialtyDto, UpdateSpecialtyDto } from "./specialty.types.js";
import type { SpecialtyRecord } from "./specialty.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class SpecialtyService {
  async create(dto: CreateSpecialtyDto): Promise<SpecialtyRecord> {
    const existing = await specialtyRepository.findByName(dto.name);
    if (existing) {
      throw new AppError(HttpStatus.CONFLICT, "Specialty already exists");
    }

    return specialtyRepository.create({ name: dto.name });
  }

  async findAll(): Promise<SpecialtyRecord[]> {
    return specialtyRepository.findAll();
  }

  async findById(id: UUID): Promise<SpecialtyRecord> {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) {
      throw AppError.notFound("Specialty not found");
    }
    return specialty;
  }

  async update(id: UUID, dto: UpdateSpecialtyDto): Promise<SpecialtyRecord> {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) {
      throw AppError.notFound("Specialty not found");
    }

    if (dto.name !== undefined && dto.name !== specialty.name) {
      const existing = await specialtyRepository.findByName(dto.name);
      if (existing) {
        throw new AppError(HttpStatus.CONFLICT, "Specialty already exists");
      }
    }

    const updated = await specialtyRepository.update(id, dto);
    if (!updated) {
      throw AppError.notFound("Specialty not found");
    }
    return updated;
  }

  async delete(id: UUID): Promise<void> {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) {
      throw AppError.notFound("Specialty not found");
    }

    const deleted = await specialtyRepository.delete(id);
    if (!deleted) {
      throw AppError.notFound("Specialty not found");
    }
  }
}

export const specialtyService = new SpecialtyService();
