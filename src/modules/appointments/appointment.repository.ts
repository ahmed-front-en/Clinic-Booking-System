import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { AppointmentRecord } from "./appointment.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

interface IdRow {
  id: UUID;
}

interface SlotStatusRow {
  id: UUID;
  status: string;
  deletedAt: Date | null;
}

export class AppointmentRepository extends BaseRepository {
  private readonly selectFields = `
    id,
    patient_id AS "patientId",
    slot_id AS "slotId",
    status,
    notes
  `;

  async create(data: {
    patientId: UUID;
    slotId: UUID;
    status: string;
    notes: string | null;
  }): Promise<AppointmentRecord> {
    const result = await this.query<AppointmentRecord>(
      `INSERT INTO appointments (patient_id, slot_id, status, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING ${this.selectFields}`,
      [data.patientId, data.slotId, data.status, data.notes],
    );
    return result.rows[0];
  }

  async findAll(): Promise<AppointmentRecord[]> {
    const result = await this.query<AppointmentRecord>(
      `SELECT ${this.selectFields}
       FROM appointments
       ORDER BY id`,
    );
    return result.rows;
  }

  async findById(id: UUID): Promise<AppointmentRecord | null> {
    const result = await this.query<AppointmentRecord>(
      `SELECT ${this.selectFields}
       FROM appointments
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByPatientId(patientId: UUID): Promise<AppointmentRecord[]> {
    const result = await this.query<AppointmentRecord>(
      `SELECT ${this.selectFields}
       FROM appointments
       WHERE patient_id = $1
       ORDER BY id`,
      [patientId],
    );
    return result.rows;
  }

  async findByDoctorId(doctorId: UUID): Promise<AppointmentRecord[]> {
    const result = await this.query<AppointmentRecord>(
      `SELECT a.id, a.patient_id AS "patientId", a.slot_id AS "slotId", a.status, a.notes
       FROM appointments a
       JOIN appointment_slots s ON a.slot_id = s.id
       WHERE s.doctor_id = $1
       ORDER BY a.id`,
      [doctorId],
    );
    return result.rows;
  }

  async existsForSlot(slotId: UUID): Promise<boolean> {
    const result = await this.query<IdRow>(
      `SELECT id FROM appointments WHERE slot_id = $1`,
      [slotId],
    );
    return result.rows.length > 0;
  }

  async findSlotById(id: UUID): Promise<SlotStatusRow | null> {
    const result = await this.query<SlotStatusRow>(
      `SELECT id, status, deleted_at AS "deletedAt"
       FROM appointment_slots
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findPatientById(id: UUID): Promise<IdRow | null> {
    const result = await this.query<IdRow>(
      `SELECT id FROM patients WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async updateSlotStatus(slotId: UUID, status: string): Promise<void> {
    await this.query(
      `UPDATE appointment_slots SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, slotId],
    );
  }

  async update(
    id: UUID,
    data: {
      status?: string;
      notes?: string | null;
    },
  ): Promise<AppointmentRecord | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.status !== undefined) {
      sets.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.notes !== undefined) {
      sets.push(`notes = $${paramIndex++}`);
      values.push(data.notes);
    }

    if (sets.length === 0) return null;

    values.push(id);
    const result = await this.query<AppointmentRecord>(
      `UPDATE appointments
       SET ${sets.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING ${this.selectFields}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async delete(id: UUID): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM appointments WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }

}

export const appointmentRepository = new AppointmentRepository(pool);
