export interface CreateDoctorDto {
  userId: string;
  clinicId: string;
  specialtyId: string;
  consultationFee: number;
  bio?: string | null;
  experienceYears: number;
}

export interface UpdateDoctorDto {
  clinicId?: string;
  specialtyId?: string;
  consultationFee?: number;
  bio?: string | null;
  experienceYears?: number;
}
