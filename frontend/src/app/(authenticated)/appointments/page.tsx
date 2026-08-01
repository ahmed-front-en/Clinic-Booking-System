"use client";

import Link from "next/link";
import { CalendarPlus, CalendarDays, Inbox } from "lucide-react";
import { useMyAppointments, useCancelAppointment } from "@/features/appointments";
import { AppointmentCard } from "@/components/business/AppointmentCard";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppointmentStatus } from "@/types/enums";

const UPCOMING_STATUSES = new Set<AppointmentStatus>(["scheduled", "confirmed"]);
const PAST_STATUSES = new Set<AppointmentStatus>(["completed", "cancelled", "no_show"]);

export default function PatientAppointmentsPage() {
  const { data: appointments, isPending, isError, refetch } = useMyAppointments();
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment();

  const upcoming =
    appointments?.filter((appointment) =>
      UPCOMING_STATUSES.has(appointment.status),
    ) ?? [];
  const past =
    appointments?.filter((appointment) => PAST_STATUSES.has(appointment.status)) ??
    [];

  if (isError) {
    return (
      <div className="p-6">
        <ErrorBanner
          message="Could not load your appointments."
          onRetry={refetch}
        />
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

  const empty = appointments?.length === 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Appointments
          </h1>
          <p className="text-lg text-muted-foreground">
            View and manage all of your appointments.
          </p>
        </div>
        <Link href="/book">
          <Button>
            <CalendarPlus />
            Book Appointment
          </Button>
        </Link>
      </header>

      {empty ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={<CalendarDays className="size-12" />}
            title="No appointments yet"
            description="Book your first appointment to get started."
            action={
              <Link href="/book">
                <Button>
                  <CalendarPlus />
                  Book Appointment
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<Inbox className="size-12" />}
                title="No upcoming appointments"
                description="When you book an appointment, it will appear here."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={(id) => cancelAppointment(id)}
                    isCancelling={isCancelling}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {past.length === 0 ? (
              <EmptyState
                icon={<Inbox className="size-12" />}
                title="No past appointments"
                description="Completed and cancelled appointments will appear here."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {past.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
