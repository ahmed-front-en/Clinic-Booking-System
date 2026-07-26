import { useCallback } from "react"
import type { ApiError } from "@/types/api"

interface FieldErrors {
  [field: string]: string
}

export function useApiError() {
  function parse(error: unknown): { message: string; fieldErrors: FieldErrors } {
    if (!error || typeof error !== "object") {
      return { message: "An unexpected error occurred", fieldErrors: {} }
    }

    const apiError = error as ApiError & { response?: { data?: ApiError } }

    const err: ApiError | undefined =
      apiError.response?.data ?? (apiError.success === false ? apiError : undefined)

    if (!err || err.success !== false) {
      return { message: "An unexpected error occurred", fieldErrors: {} }
    }

    const fieldErrors: FieldErrors = {}
    if (err.errors) {
      for (const ve of err.errors) {
        const path = ve.path.join(".")
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = ve.message
        }
      }
    }

    return { message: err.message || "An unexpected error occurred", fieldErrors }
  }

  const getFieldError = useCallback(
    (field: string, fieldErrors: FieldErrors): string | undefined => {
      return fieldErrors[field]
    },
    [],
  )

  const hasErrors = useCallback((fieldErrors: FieldErrors): boolean => {
    return Object.keys(fieldErrors).length > 0
  }, [])

  return { parse, getFieldError, hasErrors }
}
