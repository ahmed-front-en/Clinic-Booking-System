import type { UUID } from "../../shared/types/common.types.js";
import type { DoctorSummary } from "../../shared/types/read-models.js";

export interface DoctorRecord {
  id: UUID;
  userId: UUID;
  clinicId: UUID;
  specialtyId: UUID;
  consultationFee: string;
  bio: string | null;
  experienceYears: number;
}

export interface DoctorReadModel extends DoctorRecord {
  doctor: DoctorSummary;
}
