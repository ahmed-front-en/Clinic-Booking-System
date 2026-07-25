import { z } from "zod";

export const createPaymentSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(["cash", "card", "bank_transfer", "online"]),
  status: z.enum(["pending", "paid", "failed", "refunded"]).optional().default("pending"),
  transactionReference: z.string().max(255).nullable().optional(),
});

export const updatePaymentSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  method: z.enum(["cash", "card", "bank_transfer", "online"]).optional(),
  status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  transactionReference: z.string().max(255).nullable().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
