"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createDoctorSchema,
  updateDoctorSchema,
  type CreateDoctorInput,
  type UpdateDoctorInput,
} from "@/schemas/doctor";
import type { ClinicRecord } from "@/types/models/clinic";
import type { SpecialtyRecord } from "@/types/models/specialty";
import type { UserRecord } from "@/types/models/user";
import type { DoctorRecord } from "@/types/models/doctor";
import { useApiError } from "@/hooks/useApiError";

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  doctor?: DoctorRecord | null;
  users: UserRecord[];
  clinics: ClinicRecord[];
  specialties: SpecialtyRecord[];
  onSubmit: (data: CreateDoctorInput | UpdateDoctorInput) => void;
  isSubmitting?: boolean;
}

export function DoctorFormModal({
  open,
  onClose,
  doctor,
  users,
  clinics,
  specialties,
  onSubmit,
  isSubmitting,
}: DoctorFormModalProps) {
  const { parse } = useApiError();
  const [userId, setUserId] = useState(doctor?.userId ?? "");
  const [clinicId, setClinicId] = useState(doctor?.clinicId ?? "");
  const [specialtyId, setSpecialtyId] = useState(doctor?.specialtyId ?? "");
  const [consultationFee, setConsultationFee] = useState(
    doctor ? String(doctor.consultationFee) : "",
  );
  const [experienceYears, setExperienceYears] = useState(
    doctor ? String(doctor.experienceYears) : "",
  );
  const [bio, setBio] = useState(doctor?.bio ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const payload = {
      ...(doctor ? {} : { userId }),
      clinicId,
      specialtyId,
      consultationFee: Number(consultationFee),
      experienceYears: experienceYears === "" ? undefined : Number(experienceYears),
      bio: bio.trim() === "" ? null : bio.trim(),
    };
    const result = doctor
      ? updateDoctorSchema.safeParse(payload)
      : createDoctorSchema.safeParse(payload);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    Promise.resolve(onSubmit(result.data)).catch((err: unknown) => {
      const { message } = parse(err);
      setFormError(message);
    });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{doctor ? "Edit doctor" : "Create doctor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {formError}
            </div>
          )}

          {!doctor && (
            <div className="space-y-2">
              <Label htmlFor="userId">User</Label>
              <Select
                value={userId}
                onValueChange={(value) => setUserId(value ?? "")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="userId" className="w-full">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.userId && (
                <p className="text-xs text-destructive">{fieldErrors.userId}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="clinicId">Clinic</Label>
            <Select value={clinicId} onValueChange={(value) => setClinicId(value ?? "")} disabled={isSubmitting}>
              <SelectTrigger id="clinicId" className="w-full">
                <SelectValue placeholder="Select clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.clinicId && (
              <p className="text-xs text-destructive">{fieldErrors.clinicId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialtyId">Specialty</Label>
            <Select
              value={specialtyId}
              onValueChange={(value) => setSpecialtyId(value ?? "")}
              disabled={isSubmitting}
            >
              <SelectTrigger id="specialtyId" className="w-full">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.specialtyId && (
              <p className="text-xs text-destructive">{fieldErrors.specialtyId}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation fee</Label>
              <Input
                id="consultationFee"
                type="number"
                min="0"
                step="0.01"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                hasError={Boolean(fieldErrors.consultationFee)}
                disabled={isSubmitting}
              />
              {fieldErrors.consultationFee && (
                <p className="text-xs text-destructive">
                  {fieldErrors.consultationFee}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceYears">Experience (years)</Label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                step="1"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                hasError={Boolean(fieldErrors.experienceYears)}
                disabled={isSubmitting}
              />
              {fieldErrors.experienceYears && (
                <p className="text-xs text-destructive">
                  {fieldErrors.experienceYears}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : doctor ? "Save changes" : "Create doctor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
