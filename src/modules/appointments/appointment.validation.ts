import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  slotId: z.string().uuid(),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  notes: z.string().max(500).nullable().optional(),
});
