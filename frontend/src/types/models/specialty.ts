export interface SpecialtyRecord {
  id: string;
  name: string;
}

export interface SpecialtyCreateRequest {
  name: string;
}

export interface SpecialtyUpdateRequest {
  name?: string;
}
