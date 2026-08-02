import type { DoctorSummary } from "./read-models";

export interface DoctorRecord {
  id: string;
  userId: string;
  clinicId: string;
  specialtyId: string;
  consultationFee: number;
  bio: string | null;
  experienceYears: number;
}

export interface DoctorReadModel extends DoctorRecord {
  doctor: DoctorSummary;
}

export interface DoctorCreateRequest {
  userId: string;
  clinicId: string;
  specialtyId: string;
  consultationFee: number;
  bio?: string | null;
  experienceYears?: number;
}

export interface DoctorUpdateRequest {
  clinicId?: string;
  specialtyId?: string;
  consultationFee?: number;
  bio?: string | null;
  experienceYears?: number;
}
