import { BaseRepository } from "../../shared/repositories/base.repository.js";
import { pool } from "../../services/database.service.js";
import type { DoctorRecord } from "./doctor.interfaces.js";
import type { UUID } from "../../shared/types/common.types.js";

interface UserRow {
  id: UUID;
  role: string;
}

interface IdRow {
  id: UUID;
}

export class DoctorRepository extends BaseRepository {
  private readonly selectFields = `
    id,
    user_id AS "userId",
    clinic_id AS "clinicId",
    specialty_id AS "specialtyId",
    consultation_fee AS "consultationFee",
    bio,
    experience_years AS "experienceYears"
  `;

  async create(data: {
    userId: UUID;
    clinicId: UUID;
    specialtyId: UUID;
    consultationFee: string;
    bio: string | null;
    experienceYears: number;
  }): Promise<DoctorRecord> {
    const result = await this.query<DoctorRecord>(
      `INSERT INTO doctors (user_id, clinic_id, specialty_id, consultation_fee, bio, experience_years)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${this.selectFields}`,
      [data.userId, data.clinicId, data.specialtyId, data.consultationFee, data.bio, data.experienceYears],
    );
    return result.rows[0];
  }

  async findAll(): Promise<DoctorRecord[]> {
    const result = await this.query<DoctorRecord>(
      `SELECT ${this.selectFields}
       FROM doctors
       ORDER BY experience_years DESC, id ASC`,
    );
    return result.rows;
  }

  async findById(id: UUID): Promise<DoctorRecord | null> {
    const result = await this.query<DoctorRecord>(
      `SELECT ${this.selectFields}
       FROM doctors
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findByUserId(userId: UUID): Promise<DoctorRecord | null> {
    const result = await this.query<DoctorRecord>(
      `SELECT ${this.selectFields}
       FROM doctors
       WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0] ?? null;
  }

  async findUserById(id: UUID): Promise<UserRow | null> {
    const result = await this.query<UserRow>(
      `SELECT id, role
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findClinicById(id: UUID): Promise<IdRow | null> {
    const result = await this.query<IdRow>(
      `SELECT id FROM clinics WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findSpecialtyById(id: UUID): Promise<IdRow | null> {
    const result = await this.query<IdRow>(
      `SELECT id FROM specialties WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async update(
    id: UUID,
    data: {
      clinicId?: UUID;
      specialtyId?: UUID;
      consultationFee?: string;
      bio?: string | null;
      experienceYears?: number;
    },
  ): Promise<DoctorRecord | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.clinicId !== undefined) {
      sets.push(`clinic_id = $${paramIndex++}`);
      values.push(data.clinicId);
    }
    if (data.specialtyId !== undefined) {
      sets.push(`specialty_id = $${paramIndex++}`);
      values.push(data.specialtyId);
    }
    if (data.consultationFee !== undefined) {
      sets.push(`consultation_fee = $${paramIndex++}`);
      values.push(data.consultationFee);
    }
    if (data.bio !== undefined) {
      sets.push(`bio = $${paramIndex++}`);
      values.push(data.bio);
    }
    if (data.experienceYears !== undefined) {
      sets.push(`experience_years = $${paramIndex++}`);
      values.push(data.experienceYears);
    }

    if (sets.length === 0) return null;

    values.push(id);
    const result = await this.query<DoctorRecord>(
      `UPDATE doctors
       SET ${sets.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING ${this.selectFields}`,
      values,
    );
    return result.rows[0] ?? null;
  }

  async delete(id: UUID): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM doctors WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}

export const doctorRepository = new DoctorRepository(pool);
