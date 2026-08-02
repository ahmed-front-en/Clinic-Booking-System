import type { UUID } from "../../shared/types/common.types.js";
import type { DoctorSummary } from "../../shared/types/read-models.js";

export interface DoctorScheduleRecord {
  id: UUID;
  doctorId: UUID;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface DoctorScheduleReadModel extends DoctorScheduleRecord {
  doctor: DoctorSummary;
}
