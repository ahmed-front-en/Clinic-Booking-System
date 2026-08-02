export interface PatientSummary {
  id: string;
  fullName: string;
}

export interface DoctorSummary {
  id: string;
  displayName: string;
  clinicName: string;
  specialtyName: string;
}

export interface SlotSummary {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}
