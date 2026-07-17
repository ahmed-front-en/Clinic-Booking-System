import type { UUID } from "../../shared/types/common.types.js";

export interface DoctorScheduleRecord {
  id: UUID;
  doctorId: UUID;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}
