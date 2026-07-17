import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { SpecialtyRecord } from "./specialty.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

export class SpecialtyRepository extends BaseRepository {
  private readonly selectFields = `
    id,
    name
  `;

  async create(data: { name: string }): Promise<SpecialtyRecord> {
    const result = await this.query<SpecialtyRecord>(
      `INSERT INTO specialties (name)
       VALUES ($1)
       RETURNING ${this.selectFields}`,
      [data.name],
    );
    return result.rows[0];
  }

  async findAll(): Promise<SpecialtyRecord[]> {
    const result = await this.query<SpecialtyRecord>(
      `SELECT ${this.selectFields}
       FROM specialties
       ORDER BY name ASC`,
    );
    return result.rows;
  }

  async findById(id: UUID): Promise<SpecialtyRecord | null> {
    const result = await this.query<SpecialtyRecord>(
      `SELECT ${this.selectFields}
       FROM specialties
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByName(name: string): Promise<SpecialtyRecord | null> {
    const result = await this.query<SpecialtyRecord>(
      `SELECT ${this.selectFields}
       FROM specialties
       WHERE name = $1`,
      [name],
    );
    return result.rows[0] ?? null;
  }

  async update(id: UUID, data: { name?: string }): Promise<SpecialtyRecord | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      sets.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (sets.length === 0) return null;

    values.push(id);
    const result = await this.query<SpecialtyRecord>(
      `UPDATE specialties
       SET ${sets.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING ${this.selectFields}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async delete(id: UUID): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM specialties WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const specialtyRepository = new SpecialtyRepository(pool);
