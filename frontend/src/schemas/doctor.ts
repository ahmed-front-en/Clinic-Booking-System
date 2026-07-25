import { z } from "zod";

export const createDoctorSchema = z.object({
  userId: z.string().uuid(),
  clinicId: z.string().uuid(),
  specialtyId: z.string().uuid(),
  consultationFee: z.number().min(0),
  bio: z.string().nullable().optional(),
  experienceYears: z.number().int().min(0).optional(),
});

export const updateDoctorSchema = z.object({
  userId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  specialtyId: z.string().uuid().optional(),
  consultationFee: z.number().min(0).optional(),
  bio: z.string().nullable().optional(),
  experienceYears: z.number().int().min(0).optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
