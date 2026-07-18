import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { AppointmentSlotRecord } from "./appointment-slot.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

interface IdRow {
  id: UUID;
}

export class AppointmentSlotRepository extends BaseRepository {
  private readonly selectFields = `
    id,
    doctor_id AS "doctorId",
    doctor_schedule_id AS "doctorScheduleId",
    slot_date AS "slotDate",
    start_time AS "startTime",
    end_time AS "endTime",
    status,
    created_at AS "createdAt",
    updated_at AS "updatedAt",
    deleted_at AS "deletedAt"
  `;

  async create(data: {
    doctorId: UUID;
    doctorScheduleId: UUID;
    slotDate: string;
    startTime: string;
    endTime: string;
    status?: string;
  }): Promise<AppointmentSlotRecord> {
    const result = await this.query<AppointmentSlotRecord>(
      `INSERT INTO appointment_slots (doctor_id, doctor_schedule_id, slot_date, start_time, end_time, status)
       VALUES ($1, $2, $3::date, $4::time, $5::time, $6)
       RETURNING ${this.selectFields}`,
      [data.doctorId, data.doctorScheduleId, data.slotDate, data.startTime, data.endTime, data.status ?? "available"],
    );
    return result.rows[0];
  }

  async findAll(): Promise<AppointmentSlotRecord[]> {
    const result = await this.query<AppointmentSlotRecord>(
      `SELECT ${this.selectFields}
       FROM appointment_slots
       ORDER BY slot_date, start_time`,
    );
    return result.rows;
  }

  async findById(id: UUID): Promise<AppointmentSlotRecord | null> {
    const result = await this.query<AppointmentSlotRecord>(
      `SELECT ${this.selectFields}
       FROM appointment_slots
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByDoctorId(doctorId: UUID): Promise<AppointmentSlotRecord[]> {
    const result = await this.query<AppointmentSlotRecord>(
      `SELECT ${this.selectFields}
       FROM appointment_slots
       WHERE doctor_id = $1
       ORDER BY slot_date, start_time`,
      [doctorId],
    );
    return result.rows;
  }

  async findByDate(slotDate: string): Promise<AppointmentSlotRecord[]> {
    const result = await this.query<AppointmentSlotRecord>(
      `SELECT ${this.selectFields}
       FROM appointment_slots
       WHERE slot_date = $1::date
       ORDER BY start_time`,
      [slotDate],
    );
    return result.rows;
  }

  async findAvailable(filters?: { doctorId?: UUID; date?: string }): Promise<AppointmentSlotRecord[]> {
    const conditions: string[] = ["status = 'available'"];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters?.doctorId) {
      conditions.push(`doctor_id = $${paramIndex++}`);
      values.push(filters.doctorId);
    }
    if (filters?.date) {
      conditions.push(`slot_date = $${paramIndex++}::date`);
      values.push(filters.date);
    }

    const result = await this.query<AppointmentSlotRecord>(
      `SELECT ${this.selectFields}
       FROM appointment_slots
       WHERE ${conditions.join(" AND ")}
       ORDER BY slot_date, start_time`,
      values,
    );
    return result.rows;
  }

  async findDuplicate(
    doctorId: UUID,
    slotDate: string,
    startTime: string,
  ): Promise<AppointmentSlotRecord | null> {
    const result = await this.query<AppointmentSlotRecord>(
      `SELECT ${this.selectFields}
       FROM appointment_slots
       WHERE doctor_id = $1 AND slot_date = $2::date AND start_time = $3::time`,
      [doctorId, slotDate, startTime],
    );
    return result.rows[0] ?? null;
  }

  async findDoctorById(id: UUID): Promise<IdRow | null> {
    const result = await this.query<IdRow>(
      `SELECT id FROM doctors WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findDoctorScheduleById(id: UUID): Promise<IdRow | null> {
    const result = await this.query<IdRow>(
      `SELECT id FROM doctor_schedules WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async update(
    id: UUID,
    data: {
      slotDate?: string;
      startTime?: string;
      endTime?: string;
      status?: string;
    },
  ): Promise<AppointmentSlotRecord | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.slotDate !== undefined) {
      sets.push(`slot_date = $${paramIndex++}::date`);
      values.push(data.slotDate);
    }
    if (data.startTime !== undefined) {
      sets.push(`start_time = $${paramIndex++}::time`);
      values.push(data.startTime);
    }
    if (data.endTime !== undefined) {
      sets.push(`end_time = $${paramIndex++}::time`);
      values.push(data.endTime);
    }
    if (data.status !== undefined) {
      sets.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (sets.length === 0) return null;

    sets.push(`updated_at = NOW()`);

    values.push(id);
    const result = await this.query<AppointmentSlotRecord>(
      `UPDATE appointment_slots
       SET ${sets.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING ${this.selectFields}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async delete(id: UUID): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM appointment_slots WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const appointmentSlotRepository = new AppointmentSlotRepository(pool);
