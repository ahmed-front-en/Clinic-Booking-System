"use client";

import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CalendarPlus, CalendarDays, CalendarClock } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useMyAppointments, useCancelAppointment } from "@/features/appointments";
import { usePatientProfile } from "@/features/patients";
import { useMySchedule } from "@/features/schedules";
import { usePrefetchBookingData } from "@/hooks/usePrefetchBookingData";
import { AppointmentCard } from "@/components/business/AppointmentCard";
import { ProfileSummaryCard } from "@/components/business/ProfileSummaryCard";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import type { AppointmentStatus } from "@/types/enums";

const WeeklyCalendar = dynamic(
  () => import("@/components/business/WeeklyCalendar").then((mod) => mod.WeeklyCalendar),
  { loading: () => <Skeleton variant="calendar" /> },
);

const UPCOMING_STATUSES = new Set<AppointmentStatus>([
  "scheduled",
  "confirmed",
]);

function PatientDashboardContent() {
  const { data: appointments, isPending, isError, refetch } = useMyAppointments();
  const { data: patient, isPending: isProfilePending } = usePatientProfile();
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment();
  const prefetchBooking = usePrefetchBookingData();

  useEffect(() => {
    prefetchBooking();
  }, [prefetchBooking]);

  const upcoming = useMemo(
    () =>
      appointments?.filter((appointment) =>
        UPCOMING_STATUSES.has(appointment.status),
      ) ?? [],
    [appointments],
  );
  const handleCancel = useCallback(
    (id: string) => cancelAppointment(id),
    [cancelAppointment],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Patient Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back. Here is an overview of your health profile and upcoming
            schedule.
          </p>
        </div>
        <Link
          href="/book"
          onMouseEnter={prefetchBooking}
          onFocus={prefetchBooking}
        >
          <Button>
            <CalendarPlus />
            Book New Appointment
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="flex flex-col gap-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Upcoming Appointments
            </h2>
            <Link
              href="/appointments"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {isError && (
            <ErrorBanner
              message="Could not load your appointments."
              onRetry={refetch}
            />
          )}

          {isPending ? (
            <div className="space-y-3">
              <Skeleton variant="card" className="h-20" />
              <Skeleton variant="card" className="h-20" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                icon={<CalendarDays className="size-12" />}
                title="No upcoming appointments"
                description="Book your first appointment to get started with your health journey."
                action={
                  <Link
                    href="/book"
                    onMouseEnter={prefetchBooking}
                    onFocus={prefetchBooking}
                  >
                    <Button>
                      <CalendarPlus />
                      Book Appointment
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={handleCancel}
                  isCancelling={isCancelling}
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 lg:col-span-4">
          <h2 className="text-xl font-semibold text-foreground">Health Summary</h2>
          {isProfilePending ? (
            <Skeleton variant="card" className="h-48" />
          ) : (
            <ProfileSummaryCard patient={patient ?? null} />
          )}
        </section>
      </div>
    </div>
  );
}

function DoctorDashboardContent() {
  const { data: appointments, isPending, isError, refetch } = useMyAppointments();
  const {
    data: schedules,
    isPending: isSchedulePending,
    isError: isScheduleError,
    refetch: refetchSchedule,
  } = useMySchedule();
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment();

  const upcoming = useMemo(
    () =>
      appointments?.filter((appointment) =>
        UPCOMING_STATUSES.has(appointment.status),
      ) ?? [],
    [appointments],
  );
  const handleCancel = useCallback(
    (id: string) => cancelAppointment(id),
    [cancelAppointment],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Doctor Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Here is an overview of your upcoming appointments and weekly schedule.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="flex flex-col gap-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Upcoming Appointments
            </h2>
            <Link
              href="/appointments"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {isError && (
            <ErrorBanner
              message="Could not load your appointments."
              onRetry={refetch}
            />
          )}

          {isPending ? (
            <div className="space-y-3">
              <Skeleton variant="card" className="h-20" />
              <Skeleton variant="card" className="h-20" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                icon={<CalendarDays className="size-12" />}
                title="No appointments scheduled"
                description="Appointments booked by your patients will appear here."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={handleCancel}
                  isCancelling={isCancelling}
                  viewer="doctor"
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 lg:col-span-4">
          <h2 className="text-xl font-semibold text-foreground">Weekly Schedule</h2>
          {isSchedulePending ? (
            <Skeleton variant="card" className="h-48" />
          ) : isScheduleError ? (
            <ErrorBanner
              message="Could not load your schedule."
              onRetry={refetchSchedule}
            />
          ) : (schedules?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                icon={<CalendarClock className="size-12" />}
                title="No schedule defined"
                description="Contact your administrator to set up your weekly schedule."
              />
            </div>
          ) : (
            <WeeklyCalendar schedules={schedules ?? []} />
          )}
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return user?.role === "doctor" ? (
    <DoctorDashboardContent />
  ) : (
    <PatientDashboardContent />
  );
}
