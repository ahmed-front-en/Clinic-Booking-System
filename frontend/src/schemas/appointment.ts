import { z } from "zod";

export const createAppointmentSchema = z.object({
  slotId: z.string().uuid(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
