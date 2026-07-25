export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export const STALE_TIMES = {
  clinics: 300_000,
  specialties: 300_000,
  doctors: 120_000,
  availableSlots: 30_000,
  myAppointments: 30_000,
  mySchedule: 300_000,
  myProfile: Infinity,
  myPayments: 60_000,
  myReviews: 120_000,
  adminLists: 60_000,
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
} as const;
