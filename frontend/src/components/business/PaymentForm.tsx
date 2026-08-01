"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPaymentSchema, type CreatePaymentInput } from "@/schemas/payment";
import { PAYMENT_METHODS } from "@/types/enums";
import type { PaymentRecord } from "@/types/models/payment";
import { useApiError } from "@/hooks/useApiError";

interface PaymentFormProps {
  payment: PaymentRecord;
  onSubmit: (data: CreatePaymentInput) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function PaymentForm({ payment, onSubmit, isSubmitting }: PaymentFormProps) {
  const { parse } = useApiError();
  const [amount, setAmount] = useState(String(payment.amount));
  const [method, setMethod] = useState(payment.method);
  const [transactionReference, setTransactionReference] = useState(
    payment.transactionReference ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const result = createPaymentSchema.safeParse({
      appointmentId: payment.appointmentId,
      amount: Number(amount),
      method,
      transactionReference:
        transactionReference.trim() === "" ? null : transactionReference.trim(),
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    Promise.resolve(onSubmit(result.data)).catch((err: unknown) => {
      const { message } = parse(err);
      setFormError(message);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      <input type="hidden" name="appointmentId" value={payment.appointmentId} />

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hasError={Boolean(fieldErrors.amount)}
          disabled={isSubmitting}
        />
        {fieldErrors.amount && (
          <p className="text-xs text-destructive">{fieldErrors.amount}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Payment method</Label>
        <Select
          value={method}
          onValueChange={(value) => setMethod(value as typeof method)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="method" className="w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((option) => (
              <SelectItem key={option} value={option}>
                {option.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.method && (
          <p className="text-xs text-destructive">{fieldErrors.method}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionReference">Transaction reference (optional)</Label>
        <Input
          id="transactionReference"
          name="transactionReference"
          value={transactionReference}
          onChange={(e) => setTransactionReference(e.target.value)}
          hasError={Boolean(fieldErrors.transactionReference)}
          disabled={isSubmitting}
        />
        {fieldErrors.transactionReference && (
          <p className="text-xs text-destructive">
            {fieldErrors.transactionReference}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit payment"}
        </Button>
      </div>
    </form>
  );
}
