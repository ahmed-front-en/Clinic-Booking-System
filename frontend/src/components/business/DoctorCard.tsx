"use client";

import { memo } from "react";
import type { DoctorReadModel } from "@/types/models/doctor";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/business/StarRating";
import { User, Award, DollarSign, Building2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

interface DoctorCardProps {
  doctor: DoctorReadModel;
  rating?: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const DoctorCard = memo(function DoctorCard({
  doctor,
  rating,
  isSelected,
  onSelect,
}: DoctorCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-all hover:border-primary",
        isSelected
          ? "border-2 border-primary bg-primary/5 shadow-md"
          : "border-border bg-surface-container-lowest",
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="size-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-on-surface">
                  {doctor.doctor.displayName}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-primary">
                  <Stethoscope className="size-4" />
                  <span>{doctor.doctor.specialtyName}</span>
                </div>
              </div>
              {typeof rating === "number" && (
                <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                  <StarRating rating={rating} readonly />
                  <span className="text-xs text-muted-foreground">({rating})</span>
                </div>
              )}
            </div>

            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 shrink-0 text-muted-foreground" />
                <span>{doctor.doctor.clinicName}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                {doctor.experienceYears > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Award className="size-4 text-primary" />
                    <span>{doctor.experienceYears} years experience</span>
                  </div>
                )}
                <div className="flex items-center font-semibold text-on-surface">
                  <DollarSign className="size-4 text-primary" />
                  <span>Fee: ${doctor.consultationFee}</span>
                </div>
              </div>
            </div>

            {doctor.bio && (
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                {doctor.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
