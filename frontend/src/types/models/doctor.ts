export interface DoctorRecord {
  id: string;
  userId: string;
  clinicId: string;
  specialtyId: string;
  consultationFee: number;
  bio: string | null;
  experienceYears: number;
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
