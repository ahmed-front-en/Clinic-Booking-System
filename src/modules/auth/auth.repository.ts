import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { UserRecord, CreateUserInput } from "./auth.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class AuthRepository extends BaseRepository {
  private readonly selectFields = `
id,
email,
password_hash AS "passwordHash",
role,
is_verified AS "isVerified",
created_at AS "createdAt",
updated_at AS "updatedAt",
deleted_at AS "deletedAt"
`;

  async create(data: CreateUserInput): Promise<UserRecord> {
    const result = await this.query<UserRecord>(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING ${this.selectFields}`,
      [data.email, data.passwordHash, data.role],
    );
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.query<UserRecord>(
      `SELECT ${this.selectFields}
       FROM users
       WHERE email = $1
       AND deleted_at IS NULL`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: UUID): Promise<UserRecord | null> {
    const result = await this.query<UserRecord>(
      `SELECT ${this.selectFields}
       FROM users
       WHERE id = $1
       AND deleted_at IS NULL`,
      [id],
    );
    return result.rows[0] ?? null;
  }
}

export const authRepository = new AuthRepository(pool);
