import { usersRepository } from "./users.repository.js";
import type { UpdateUserDto, UserFilter } from "./users.types.js";
import type { UserRecord } from "./users.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class UsersService {
  async findAll(filter: UserFilter): Promise<UserRecord[]> {
    throw new Error("Not implemented");
  }

  async findById(id: UUID): Promise<UserRecord> {
    throw new Error("Not implemented");
  }

  async update(id: UUID, dto: UpdateUserDto): Promise<UserRecord> {
    throw new Error("Not implemented");
  }

  async softDelete(id: UUID): Promise<void> {
    throw new Error("Not implemented");
  }
}

export const usersService = new UsersService();
