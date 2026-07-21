export interface CreatePatientDto {
  userId: string;
  fullName: string;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
}

export interface UpdatePatientDto {
  fullName?: string;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
}
