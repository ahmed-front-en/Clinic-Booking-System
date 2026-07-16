import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import type { UserRecord, UpdateUserInput } from "./users.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class UsersRepository extends BaseRepository {
  async findAll(): Promise<UserRecord[]> {
    throw new AppError(HttpStatus.NOT_IMPLEMENTED, "Not implemented");
  }

  async findById(_id: UUID): Promise<UserRecord | null> {
    throw new AppError(HttpStatus.NOT_IMPLEMENTED, "Not implemented");
  }

  async update(_id: UUID, _data: UpdateUserInput): Promise<UserRecord> {
    throw new AppError(HttpStatus.NOT_IMPLEMENTED, "Not implemented");
  }

  async softDelete(_id: UUID): Promise<void> {
    throw new AppError(HttpStatus.NOT_IMPLEMENTED, "Not implemented");
  }
}

export const usersRepository = new UsersRepository(pool);
