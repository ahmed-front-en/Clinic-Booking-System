"use client";

import dynamic from "next/dynamic";
import { CalendarClock } from "lucide-react";
import { useMySchedule } from "@/features/schedules";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";
import { EmptyState } from "@/components/feedback/EmptyState";

const WeeklyCalendar = dynamic(
  () => import("@/components/business/WeeklyCalendar").then((mod) => mod.WeeklyCalendar),
  { loading: () => <Skeleton variant="calendar" /> },
);

export default function DoctorSchedulePage() {
  const { data: schedules, isPending, isError, refetch } = useMySchedule();

  if (isError) {
    return (
      <div className="p-6">
        <ErrorBanner message="Could not load your schedule." onRetry={refetch} />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton variant="calendar" />
      </div>
    );
  }

  const empty = schedules?.length === 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Schedule
        </h1>
        <p className="text-lg text-muted-foreground">
          Your weekly recurring schedule.
        </p>
      </header>

      {empty ? (
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
    </div>
  );
}
