export interface CreateAppointmentDto {
  patientId: string;
  slotId: string;
  status?: string;
  notes?: string | null;
}

export interface UpdateAppointmentDto {
  status?: string;
  notes?: string | null;
}
