import type { PaginationParams } from "../types/api";
import type { AvailableSlotsParams } from "../types/models/slot";
import type { UserFilters } from "../types/models/user";

type UserListParams = UserFilters & PaginationParams;

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  patients: {
    me: ["patients", "me"] as const,
    all: (params?: PaginationParams) => ["patients", "admin", params] as const,
    byId: (id: string) => ["patients", id] as const,
  },
  doctors: {
    all: ["doctors"] as const,
    byId: (id: string) => ["doctors", id] as const,
  },
  clinics: {
    all: ["clinics"] as const,
    byId: (id: string) => ["clinics", id] as const,
  },
  specialties: {
    all: ["specialties"] as const,
    byId: (id: string) => ["specialties", id] as const,
  },
  slots: {
    available: (params?: AvailableSlotsParams) => ["slots", "available", params] as const,
    byDoctor: (id: string) => ["slots", "doctor", id] as const,
    byDate: (date: string) => ["slots", "date", date] as const,
    admin: (params?: PaginationParams) => ["slots", "admin", params] as const,
  },
  schedules: {
    me: ["schedules", "me"] as const,
    all: ["schedules"] as const,
    admin: (params?: PaginationParams) => ["schedules", "admin", params] as const,
    byDoctor: (id: string) => ["schedules", "doctor", id] as const,
    byId: (id: string) => ["schedules", id] as const,
  },
  appointments: {
    mine: ["appointments", "mine"] as const,
    all: ["appointments"] as const,
    admin: (params?: PaginationParams) => ["appointments", "admin", params] as const,
    byId: (id: string) => ["appointments", id] as const,
    byPatient: (id: string) => ["appointments", "patient", id] as const,
    byDoctor: (id: string) => ["appointments", "doctor", id] as const,
  },
  payments: {
    mine: ["payments", "mine"] as const,
    all: ["payments"] as const,
    byId: (id: string) => ["payments", id] as const,
    byAppointment: (id: string) => ["payments", "appointment", id] as const,
    admin: (params?: PaginationParams) => ["payments", "admin", params] as const,
  },
  reviews: {
    mine: ["reviews", "mine"] as const,
    all: ["reviews"] as const,
    byId: (id: string) => ["reviews", id] as const,
    byAppointment: (id: string) => ["reviews", "appointment", id] as const,
    admin: (params?: PaginationParams) => ["reviews", "admin", params] as const,
  },
  users: {
    all: (params?: UserListParams) => ["users", params] as const,
    byId: (id: string) => ["users", id] as const,
  },
};
