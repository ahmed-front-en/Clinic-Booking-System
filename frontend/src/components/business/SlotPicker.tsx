"use client";

import type { AppointmentSlotRecord } from "@/types/models/slot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotPickerProps {
  slots: AppointmentSlotRecord[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  isLoading?: boolean;
}

export function SlotPicker({
  slots,
  selectedSlotId,
  onSelectSlot,
  selectedDate,
  onDateChange,
  isLoading,
}: SlotPickerProps) {
  // Format times e.g. "09:00:00" -> "09:00 AM"
  const formatSlotTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(":");
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const formattedHour = h % 12 === 0 ? 12 : h % 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-surface-container-low p-4">
        <div className="space-y-1">
          <Label htmlFor="slot-date" className="text-sm font-medium text-on-surface">
            Select Date
          </Label>
          <p className="text-xs text-muted-foreground">
            Choose a date to view available appointment slots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-primary" />
          <Input
            id="slot-date"
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-auto bg-surface-container-lowest"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
          <Clock className="size-4 text-primary" />
          <span>Available Time Slots</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-md bg-surface-container-high"
              />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-10 text-center text-muted-foreground">
            No available slots for this date. Please select another date.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {slots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const isAvailable = slot.status === "available";
              return (
                <Button
                  key={slot.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  disabled={!isAvailable}
                  onClick={() => onSelectSlot(slot.id)}
                  className={cn(
                    "h-12 flex-col justify-center text-xs font-medium transition-all",
                    isSelected
                      ? "bg-primary text-on-primary shadow-md"
                      : "border-border bg-surface-container-lowest text-on-surface hover:border-primary",
                  )}
                >
                  <span>{formatSlotTime(slot.startTime)}</span>
                  <span className="text-[10px] opacity-75">
                    {formatSlotTime(slot.endTime)}
                  </span>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-md bg-primary/5 p-3 text-xs text-primary">
        <Info className="size-4 shrink-0" />
        <span>Time slots are in your local timezone. Select a slot to proceed.</span>
      </div>
    </div>
  );
}
