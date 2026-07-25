import { z } from "zod";

export const createSpecialtySchema = z.object({
  name: z.string().trim().min(2).max(255),
});

export const updateSpecialtySchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
});

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>;
export type UpdateSpecialtyInput = z.infer<typeof updateSpecialtySchema>;
