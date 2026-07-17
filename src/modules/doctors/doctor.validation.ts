import { z } from "zod";

export const createDoctorSchema = z.object({
  userId: z.string().uuid(),
  clinicId: z.string().uuid(),
  specialtyId: z.string().uuid(),
  consultationFee: z.number().min(0),
  bio: z.string().trim().nullable().optional(),
  experienceYears: z.number().int().min(0),
});

export const updateDoctorSchema = z.object({
  clinicId: z.string().uuid().optional(),
  specialtyId: z.string().uuid().optional(),
  consultationFee: z.number().min(0).optional(),
  bio: z.string().trim().nullable().optional(),
  experienceYears: z.number().int().min(0).optional(),
});
