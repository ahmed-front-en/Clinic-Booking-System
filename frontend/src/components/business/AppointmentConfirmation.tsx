"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar, Clock, Building2, User, DollarSign } from "lucide-react";

interface AppointmentConfirmationProps {
  doctorName: string;
  specialtyName?: string;
  clinicName?: string;
  date: string;
  startTime: string;
  endTime: string;
  consultationFee: number;
  onViewAppointments: () => void;
}

export function AppointmentConfirmation({
  doctorName,
  specialtyName,
  clinicName,
  date,
  startTime,
  endTime,
  consultationFee,
  onViewAppointments,
}: AppointmentConfirmationProps) {
  return (
    <div className="mx-auto max-w-lg space-y-6 text-center py-6">
      <div className="flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-10" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-on-surface">
          Appointment Booked Successfully!
        </h2>
        <p className="text-sm text-muted-foreground">
          Your appointment has been scheduled. You can view or manage it from your appointments dashboard.
        </p>
      </div>

      <Card className="border-border bg-surface-container-lowest text-left shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-on-surface">{doctorName}</h3>
              {specialtyName && (
                <p className="text-xs text-primary">{specialtyName}</p>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {clinicName && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Building2 className="size-4 text-primary" />
                <span>{clinicName}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="size-4 text-primary" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border font-semibold text-on-surface">
              <span>Consultation Fee</span>
              <div className="flex items-center text-primary">
                <DollarSign className="size-4" />
                <span>${consultationFee}.00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <Button onClick={onViewAppointments} className="w-full sm:w-auto px-8">
          View My Appointments
        </Button>
      </div>
    </div>
  );
}
