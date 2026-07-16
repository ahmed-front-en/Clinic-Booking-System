import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { UserRecord, UpdateUserInput } from "./users.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class UsersRepository extends BaseRepository {
  async findAll(): Promise<UserRecord[]> {
    throw new Error("Not implemented");
  }

  async findById(id: UUID): Promise<UserRecord | null> {
    throw new Error("Not implemented");
  }

  async update(id: UUID, data: UpdateUserInput): Promise<UserRecord> {
    throw new Error("Not implemented");
  }

  async softDelete(id: UUID): Promise<void> {
    throw new Error("Not implemented");
  }
}

export const usersRepository = new UsersRepository(pool);
