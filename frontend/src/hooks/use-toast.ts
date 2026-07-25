"use client";

import { showToast, dismissToast, type ToastType } from "@/lib/toast-store";

export function useToast() {
  function toast(message: string, type: ToastType = "info") {
    showToast(message, type);
  }

  return { toast, dismissToast };
}
