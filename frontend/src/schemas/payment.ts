import { z } from "zod";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "../types/enums";

export const createPaymentSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(PAYMENT_METHODS),
  status: z.enum(PAYMENT_STATUSES).optional().default("pending"),
  transactionReference: z.string().max(255).nullable().optional(),
});

export const updatePaymentSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  status: z.enum(PAYMENT_STATUSES).optional(),
  transactionReference: z.string().max(255).nullable().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
