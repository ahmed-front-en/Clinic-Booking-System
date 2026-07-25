import { z } from "zod";
import { USER_ROLES } from "../types/enums";

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(USER_ROLES).optional(),
  isVerified: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
