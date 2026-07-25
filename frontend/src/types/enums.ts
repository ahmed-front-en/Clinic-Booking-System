export const USER_ROLES = ["patient", "doctor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SLOT_STATUSES = ["available", "booked", "cancelled"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export const APPOINTMENT_STATUSES = ["scheduled", "confirmed", "completed", "cancelled", "no_show"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "online"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type SortOrder = "asc" | "desc";
