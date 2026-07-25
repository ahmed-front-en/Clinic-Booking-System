export type UserRole = "patient" | "doctor" | "admin";

export type SlotStatus = "available" | "booked" | "cancelled";

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "online";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type SortOrder = "asc" | "desc";
