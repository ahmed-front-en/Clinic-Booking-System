export const Messages = {
  INTERNAL_ERROR: "An unexpected error occurred",
  NOT_FOUND: (resource: string) => `${resource} not found`,
  DUPLICATE: (field: string) => `${field} already exists`,
  INVALID_INPUT: "Invalid input provided",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
} as const;
