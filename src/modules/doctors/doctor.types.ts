export interface CreateDoctorDto {
  userId: string;
  clinicId: string;
  specialtyId: string;
  consultationFee: number;
  bio?: string | null;
  experienceYears: number;
  fullName?: string;
}

export interface UpdateDoctorDto {
  clinicId?: string;
  specialtyId?: string;
  consultationFee?: number;
  bio?: string | null;
  experienceYears?: number;
  fullName?: string;
}
