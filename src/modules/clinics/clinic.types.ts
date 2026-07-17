export interface CreateClinicDto {
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  description?: string | null;
}

export interface UpdateClinicDto {
  name?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  description?: string | null;
}
