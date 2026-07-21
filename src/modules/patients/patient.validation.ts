import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createPatientSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(1).max(255),
  phone: z.string().max(50).nullable().optional(),
  gender: z.string().max(20).nullable().optional(),
  birthDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)").nullable().optional(),
});

export const updatePatientSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).nullable().optional(),
  gender: z.string().max(20).nullable().optional(),
  birthDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)").nullable().optional(),
});
