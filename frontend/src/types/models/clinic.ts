export interface ClinicRecord {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  description: string | null;
}

export interface ClinicCreateRequest {
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  description?: string | null;
}

export interface ClinicUpdateRequest {
  name?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  description?: string | null;
}
