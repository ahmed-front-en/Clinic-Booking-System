import type { UserRole } from "@/types/enums";

export function getHomePathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "doctor":
      return "/dashboard";
    case "patient":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}
