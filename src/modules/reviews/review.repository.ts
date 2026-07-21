import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { ReviewRecord } from "./review.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

interface IdRow {
  id: UUID;
}

export class ReviewRepository extends BaseRepository {
  private readonly selectFields = `
    id,
    appointment_id AS "appointmentId",
    rating,
    comment
  `;

  async create(data: {
    appointmentId: UUID;
    rating: number;
    comment: string | null;
  }): Promise<ReviewRecord> {
    const result = await this.query<ReviewRecord>(
      `INSERT INTO reviews (appointment_id, rating, comment)
       VALUES ($1, $2, $3)
       RETURNING ${this.selectFields}`,
      [data.appointmentId, data.rating, data.comment],
    );
    return result.rows[0];
  }

  async findAll(): Promise<ReviewRecord[]> {
    const result = await this.query<ReviewRecord>(
      `SELECT ${this.selectFields}
       FROM reviews
       ORDER BY id`,
    );
    return result.rows;
  }

  async findById(id: UUID): Promise<ReviewRecord | null> {
    const result = await this.query<ReviewRecord>(
      `SELECT ${this.selectFields}
       FROM reviews
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByAppointmentId(appointmentId: UUID): Promise<ReviewRecord | null> {
    const result = await this.query<ReviewRecord>(
      `SELECT ${this.selectFields}
       FROM reviews
       WHERE appointment_id = $1`,
      [appointmentId],
    );
    return result.rows[0] ?? null;
  }

  async findAppointmentById(id: UUID): Promise<IdRow | null> {
    const result = await this.query<IdRow>(
      `SELECT id FROM appointments WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async existsForAppointment(appointmentId: UUID): Promise<boolean> {
    const result = await this.query<IdRow>(
      `SELECT id FROM reviews WHERE appointment_id = $1`,
      [appointmentId],
    );
    return result.rows.length > 0;
  }

  async update(
    id: UUID,
    data: {
      rating?: number;
      comment?: string | null;
    },
  ): Promise<ReviewRecord | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.rating !== undefined) {
      sets.push(`rating = $${paramIndex++}`);
      values.push(data.rating);
    }
    if (data.comment !== undefined) {
      sets.push(`comment = $${paramIndex++}`);
      values.push(data.comment);
    }

    if (sets.length === 0) return null;

    values.push(id);
    const result = await this.query<ReviewRecord>(
      `UPDATE reviews
       SET ${sets.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING ${this.selectFields}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async delete(id: UUID): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM reviews WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const reviewRepository = new ReviewRepository(pool);
