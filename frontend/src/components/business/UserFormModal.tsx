"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { updateUserSchema, type UpdateUserInput } from "@/schemas/user";
import { USER_ROLES } from "@/types/enums";
import type { UserRecord } from "@/types/models/user";
import { useApiError } from "@/hooks/useApiError";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user: UserRecord;
  onSubmit: (data: UpdateUserInput) => void;
  isSubmitting?: boolean;
}

export function UserFormModal({
  open,
  onClose,
  user,
  onSubmit,
  isSubmitting,
}: UserFormModalProps) {
  const { parse } = useApiError();
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [isVerified, setIsVerified] = useState(user.isVerified);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const result = updateUserSchema.safeParse({ email, role, isVerified });

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
          <DialogTitle>Edit user</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hasError={Boolean(fieldErrors.email)}
              disabled={isSubmitting}
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRecord["role"])}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.role && (
              <p className="text-xs text-destructive">{fieldErrors.role}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isVerified">Verified</Label>
            <Select
              value={String(isVerified)}
              onValueChange={(value) => setIsVerified(value === "true")}
              disabled={isSubmitting}
            >
              <SelectTrigger id="isVerified" className="w-full">
                <SelectValue placeholder="Select verification status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Not verified</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.isVerified && (
              <p className="text-xs text-destructive">{fieldErrors.isVerified}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
