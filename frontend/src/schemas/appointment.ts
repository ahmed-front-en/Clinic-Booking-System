import { z } from "zod";
import { APPOINTMENT_STATUSES } from "../types/enums";

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  slotId: z.string().uuid(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
