import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createAppointmentSlotSchema = z
  .object({
    doctorId: z.string().uuid(),
    doctorScheduleId: z.string().uuid(),
    slotDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)"),
    startTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
    status: z.enum(["available", "booked", "cancelled"]).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export const updateAppointmentSlotSchema = z
  .object({
    slotDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)").optional(),
    startTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)").optional(),
    endTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)").optional(),
    status: z.enum(["available", "booked", "cancelled"]).optional(),
  })
  .refine((data) => {
    if (data.startTime !== undefined && data.endTime !== undefined) {
      return data.endTime > data.startTime;
    }
    return true;
  }, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });
