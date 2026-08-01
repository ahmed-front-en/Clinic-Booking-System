"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { useMyPayments, useCreatePayment } from "@/features/payments";
import { PaymentCard } from "@/components/business/PaymentCard";
import { PaymentForm } from "@/components/business/PaymentForm";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PaymentRecord } from "@/types/models/payment";
import type { CreatePaymentInput } from "@/schemas/payment";

export default function PatientPaymentsPage() {
  const { data: payments, isPending, isError, refetch } = useMyPayments();
  const { mutate: createPayment, isPending: isPaying } = useCreatePayment();
  const [selected, setSelected] = useState<PaymentRecord | null>(null);

  if (isError) {
    return (
      <div className="p-6">
        <ErrorBanner message="Could not load your payments." onRetry={refetch} />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton variant="card" className="h-20" />
        <Skeleton variant="card" className="h-20" />
      </div>
    );
  }

  const empty = payments?.length === 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Payments
        </h1>
        <p className="text-lg text-muted-foreground">
          View your payment history and complete pending payments.
        </p>
      </header>

      {empty ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={<Wallet className="size-12" />}
            title="No payments yet"
            description="Payments for your appointments will appear here."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {payments?.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onPay={setSelected}
              isPaying={isPaying && selected?.id === payment.id}
            />
          ))}
        </div>
      )}

      <Dialog open={selected !== null} onClose={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Now</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="mt-4">
              <PaymentForm
                payment={selected}
                isSubmitting={isPaying}
                onSubmit={(data: CreatePaymentInput) => {
                  createPayment(data, {
                    onSuccess: () => setSelected(null),
                  });
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
