import type { UUID } from "../../shared/types/common.types.js";

export interface AppointmentRecord {
  id: UUID;
  patientId: UUID;
  slotId: UUID;
  status: string;
  notes: string | null;
}
