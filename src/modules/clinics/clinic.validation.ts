import { z } from "zod";

export const createClinicSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
});

export const updateClinicSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
});
