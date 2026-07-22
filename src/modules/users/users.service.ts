import { usersRepository } from "./users.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { UpdateUserDto, UserFilter } from "./users.types.js";
import type { UserRecord } from "./users.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class UsersService {
  async findAll(_filter: UserFilter): Promise<UserRecord[]> {
    return usersRepository.findAll();
  }

  async findById(id: UUID): Promise<UserRecord> {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return user;
  }

  async update(id: UUID, dto: UpdateUserDto): Promise<UserRecord> {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (user.deletedAt !== null) {
      throw new AppError(HttpStatus.CONFLICT, "Cannot update a deleted user");
    }

    if (
      dto.email === undefined &&
      dto.role === undefined &&
      dto.isVerified === undefined
    ) {
      throw new AppError(HttpStatus.BAD_REQUEST, "No fields provided for update");
    }

    if (dto.email !== undefined && dto.email !== user.email) {
      const exists = await usersRepository.emailExists(dto.email, id);
      if (exists) {
        throw new AppError(HttpStatus.CONFLICT, "Email is already in use");
      }
    }

    const updated = await usersRepository.update(id, {
      email: dto.email,
      role: dto.role,
      isVerified: dto.isVerified,
    });
    if (!updated) {
      throw AppError.notFound("User not found");
    }
    return updated;
  }

  async softDelete(id: UUID): Promise<void> {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    if (user.deletedAt !== null) {
      throw new AppError(HttpStatus.CONFLICT, "User is already deleted");
    }

    const deleted = await usersRepository.softDelete(id);
    if (!deleted) {
      throw AppError.notFound("User not found");
    }
  }
}

export const usersService = new UsersService();
