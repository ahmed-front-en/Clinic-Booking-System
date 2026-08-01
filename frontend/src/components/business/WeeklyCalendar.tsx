"use client";

import { TimeBlock } from "@/components/business/TimeBlock";
import type { DoctorScheduleRecord } from "@/types/models/schedule";

interface WeeklyCalendarProps {
  schedules: DoctorScheduleRecord[];
  className?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyCalendar({ schedules, className }: WeeklyCalendarProps) {
  return (
    <div
      className={
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7" +
        (className ? ` ${className}` : "")
      }
    >
      {DAYS.map((day, index) => {
        const entries = schedules.filter((schedule) => schedule.weekday === index);
        return (
          <div
            key={day}
            className="rounded-xl border border-border bg-card p-4"
          >
            <h3 className="mb-3 text-sm font-semibold text-foreground">{day}</h3>
            {entries.length > 0 ? (
              <div className="flex flex-col gap-2">
                {entries.map((schedule) => (
                  <TimeBlock
                    key={schedule.id}
                    startTime={schedule.startTime}
                    endTime={schedule.endTime}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Off</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
