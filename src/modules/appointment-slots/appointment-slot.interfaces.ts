import type { UUID } from "../../shared/types/common.types.js";
import type { DoctorSummary } from "../../shared/types/read-models.js";

export interface AppointmentSlotRecord {
  id: UUID;
  doctorId: UUID;
  doctorScheduleId: UUID;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AppointmentSlotReadModel extends AppointmentSlotRecord {
  doctor: DoctorSummary;
}
