"use client";

import { Building2, Stethoscope, UserRound } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { usePatientProfile, useUpdateProfile } from "@/features/patients";
import { useDoctorProfile, useUpdateDoctorProfile } from "@/features/doctors";
import { ProfileForm } from "@/components/business/ProfileForm";
import { DoctorProfileForm } from "@/components/business/DoctorProfileForm";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorBanner } from "@/components/feedback/ErrorBanner";

function PatientProfileContent() {
  const { data: patient, isPending, isError, refetch } = usePatientProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  if (isError) {
    return (
      <div className="p-6">
        <ErrorBanner message="Could not load your profile." onRetry={refetch} />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex max-w-xl flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="form" className="h-24" />
        <Skeleton variant="form" className="h-24" />
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-6 p-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <UserRound className="size-7" aria-hidden="true" />
          Profile
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your personal information.
        </p>
      </header>

      {patient && (
        <div className="rounded-xl border border-border bg-card p-5">
          <ProfileForm
            patient={patient}
            onSubmit={(data) => updateProfile(data)}
            isSubmitting={isSaving}
          />
        </div>
      )}
    </div>
  );
}

function DoctorProfileContent() {
  const { data: doctor, isPending, isError, refetch } = useDoctorProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateDoctorProfile();

  if (isError) {
    return (
      <div className="p-6">
        <ErrorBanner message="Could not load your profile." onRetry={refetch} />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex max-w-xl flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="form" className="h-24" />
        <Skeleton variant="form" className="h-24" />
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-6 p-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <UserRound className="size-7" aria-hidden="true" />
          Profile
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your professional information.
        </p>
      </header>

      {doctor && (
        <>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Stethoscope className="size-4" aria-hidden="true" />
              <span>{doctor.doctor.specialtyName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="size-4" aria-hidden="true" />
              <span>{doctor.doctor.clinicName}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <DoctorProfileForm
              doctor={doctor}
              onSubmit={(data) => updateProfile(data)}
              isSubmitting={isSaving}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  return user?.role === "doctor" ? (
    <DoctorProfileContent />
  ) : (
    <PatientProfileContent />
  );
}
