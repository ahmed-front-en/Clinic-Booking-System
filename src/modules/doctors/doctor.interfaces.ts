import type { UUID } from "../../shared/types/common.types.js";

export interface DoctorRecord {
  id: UUID;
  userId: UUID;
  clinicId: UUID;
  specialtyId: UUID;
  consultationFee: string;
  bio: string | null;
  experienceYears: number;
}
