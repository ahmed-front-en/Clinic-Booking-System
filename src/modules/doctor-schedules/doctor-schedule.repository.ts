import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { DoctorScheduleRecord } from "./doctor-schedule.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

interface IdRow {
  id: UUID;
}

export class DoctorScheduleRepository extends BaseRepository {
  private readonly selectFields = `
    id,
    doctor_id AS "doctorId",
    weekday,
    start_time AS "startTime",
    end_time AS "endTime",
    slot_duration AS "slotDuration"
  `;

  async create(data: {
    doctorId: UUID;
    weekday: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
  }): Promise<DoctorScheduleRecord> {
    const result = await this.query<DoctorScheduleRecord>(
      `INSERT INTO doctor_schedules (doctor_id, weekday, start_time, end_time, slot_duration)
       VALUES ($1, $2, $3::time, $4::time, $5)
       RETURNING ${this.selectFields}`,
      [data.doctorId, data.weekday, data.startTime, data.endTime, data.slotDuration],
    );
    return result.rows[0];
  }

  async findAll(): Promise<DoctorScheduleRecord[]> {
    const result = await this.query<DoctorScheduleRecord>(
      `SELECT ${this.selectFields}
       FROM doctor_schedules
       ORDER BY weekday, start_time`,
    );
    return result.rows;
  }

  async findById(id: UUID): Promise<DoctorScheduleRecord | null> {
    const result = await this.query<DoctorScheduleRecord>(
      `SELECT ${this.selectFields}
       FROM doctor_schedules
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByDoctorId(doctorId: UUID): Promise<DoctorScheduleRecord[]> {
    const result = await this.query<DoctorScheduleRecord>(
      `SELECT ${this.selectFields}
       FROM doctor_schedules
       WHERE doctor_id = $1
       ORDER BY weekday, start_time`,
      [doctorId],
    );
    return result.rows;
  }

  async findDuplicate(
    doctorId: UUID,
    weekday: number,
    startTime: string,
  ): Promise<DoctorScheduleRecord | null> {
    const result = await this.query<DoctorScheduleRecord>(
      `SELECT ${this.selectFields}
       FROM doctor_schedules
       WHERE doctor_id = $1 AND weekday = $2 AND start_time = $3::time`,
      [doctorId, weekday, startTime],
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

  async update(
    id: UUID,
    data: {
      weekday?: number;
      startTime?: string;
      endTime?: string;
      slotDuration?: number;
    },
  ): Promise<DoctorScheduleRecord | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.weekday !== undefined) {
      sets.push(`weekday = $${paramIndex++}`);
      values.push(data.weekday);
    }
    if (data.startTime !== undefined) {
      sets.push(`start_time = $${paramIndex++}::time`);
      values.push(data.startTime);
    }
    if (data.endTime !== undefined) {
      sets.push(`end_time = $${paramIndex++}::time`);
      values.push(data.endTime);
    }
    if (data.slotDuration !== undefined) {
      sets.push(`slot_duration = $${paramIndex++}`);
      values.push(data.slotDuration);
    }

    if (sets.length === 0) return null;

    values.push(id);
    const result = await this.query<DoctorScheduleRecord>(
      `UPDATE doctor_schedules
       SET ${sets.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING ${this.selectFields}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async delete(id: UUID): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM doctor_schedules WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const doctorScheduleRepository = new DoctorScheduleRepository(pool);
