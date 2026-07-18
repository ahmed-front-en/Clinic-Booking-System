import type { UUID } from "../../shared/types/common.types.js";

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
