import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createAppointmentSlotSchema = z.object({
  doctorId: z.string().uuid(),
  doctorScheduleId: z.string().uuid(),
  slotDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
  status: z.enum(["available", "booked", "cancelled"]).optional().default("available"),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const updateAppointmentSlotSchema = z.object({
  doctorId: z.string().uuid().optional(),
  doctorScheduleId: z.string().uuid().optional(),
  slotDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)").optional(),
  startTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)").optional(),
  endTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)").optional(),
  status: z.enum(["available", "booked", "cancelled"]).optional(),
});

export type CreateAppointmentSlotInput = z.infer<typeof createAppointmentSlotSchema>;
export type UpdateAppointmentSlotInput = z.infer<typeof updateAppointmentSlotSchema>;
