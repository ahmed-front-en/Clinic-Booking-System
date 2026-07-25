import { z } from "zod";
import { SLOT_STATUSES } from "../types/enums";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createAppointmentSlotSchema = z.object({
  doctorId: z.string().uuid(),
  doctorScheduleId: z.string().uuid(),
  slotDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
  status: z.enum(SLOT_STATUSES).optional().default("available"),
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
  status: z.enum(SLOT_STATUSES).optional(),
}).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true;
    return data.endTime > data.startTime;
  },
  { message: "End time must be after start time", path: ["endTime"] },
);

export type CreateAppointmentSlotInput = z.infer<typeof createAppointmentSlotSchema>;
export type UpdateAppointmentSlotInput = z.infer<typeof updateAppointmentSlotSchema>;
