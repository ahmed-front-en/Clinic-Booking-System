"use client";

import type { SpecialtyRecord } from "@/types/models/specialty";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecialtySelectorProps {
  specialties: SpecialtyRecord[];
  selectedSpecialtyId: string | null;
  onSelect: (specialtyId: string) => void;
  isLoading?: boolean;
}

export function SpecialtySelector({
  specialties,
  selectedSpecialtyId,
  onSelect,
  isLoading,
}: SpecialtySelectorProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg bg-surface-container-high"
          />
        ))}
      </div>
    );
  }

  if (specialties.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No specialties available.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {specialties.map((specialty) => {
        const isSelected = selectedSpecialtyId === specialty.id;
        return (
          <Card
            key={specialty.id}
            onClick={() => onSelect(specialty.id)}
            className={cn(
              "cursor-pointer transition-all hover:border-primary",
              isSelected
                ? "border-2 border-primary bg-primary/5 shadow-md"
                : "border-border bg-surface-container-lowest",
            )}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Stethoscope className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface">{specialty.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Select to view specialized doctors
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
