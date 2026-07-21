import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { PaymentRecord } from "./payment.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

interface IdRow {
  id: UUID;
}

export class PaymentRepository extends BaseRepository {
  private readonly selectFields = `
    id,
    appointment_id AS "appointmentId",
    amount,
    method,
    status,
    transaction_reference AS "transactionReference"
  `;

  async create(data: {
    appointmentId: UUID;
    amount: number;
    method: string;
    status: string;
    transactionReference: string | null;
  }): Promise<PaymentRecord> {
    const result = await this.query<PaymentRecord>(
      `INSERT INTO payments (appointment_id, amount, method, status, transaction_reference)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${this.selectFields}`,
      [data.appointmentId, data.amount, data.method, data.status, data.transactionReference],
    );
    return result.rows[0];
  }

  async findAll(): Promise<PaymentRecord[]> {
    const result = await this.query<PaymentRecord>(
      `SELECT ${this.selectFields}
       FROM payments
       ORDER BY id`,
    );
    return result.rows;
  }

  async findById(id: UUID): Promise<PaymentRecord | null> {
    const result = await this.query<PaymentRecord>(
      `SELECT ${this.selectFields}
       FROM payments
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByAppointmentId(appointmentId: UUID): Promise<PaymentRecord | null> {
    const result = await this.query<PaymentRecord>(
      `SELECT ${this.selectFields}
       FROM payments
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
      `SELECT id FROM payments WHERE appointment_id = $1`,
      [appointmentId],
    );
    return result.rows.length > 0;
  }

  async update(
    id: UUID,
    data: {
      amount?: number;
      method?: string;
      status?: string;
      transactionReference?: string | null;
    },
  ): Promise<PaymentRecord | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.amount !== undefined) {
      sets.push(`amount = $${paramIndex++}`);
      values.push(data.amount);
    }
    if (data.method !== undefined) {
      sets.push(`method = $${paramIndex++}`);
      values.push(data.method);
    }
    if (data.status !== undefined) {
      sets.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.transactionReference !== undefined) {
      sets.push(`transaction_reference = $${paramIndex++}`);
      values.push(data.transactionReference);
    }

    if (sets.length === 0) return null;

    values.push(id);
    const result = await this.query<PaymentRecord>(
      `UPDATE payments
       SET ${sets.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING ${this.selectFields}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async delete(id: UUID): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM payments WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const paymentRepository = new PaymentRepository(pool);
