import type { UUID } from "../../shared/types/common.types.js";

export interface ReviewRecord {
  id: UUID;
  appointmentId: UUID;
  rating: number;
  comment: string | null;
}
