import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import type { Toast as ToastData, ToastType } from "@/lib/toast-store";
import { dismissToast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<ToastType, string> = {
  success: "border-l-success text-success",
  error: "border-l-error text-error",
  info: "border-l-primary text-primary",
  warning: "border-l-yellow-400 text-yellow-400",
};

export function Toast({ toast }: { toast: ToastData }) {
  const Icon = iconMap[toast.type];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-surface-container px-4 py-3 shadow-lg",
        "border-l-4 animate-in slide-in-from-right",
        colorMap[toast.type],
      )}
      role="alert"
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm text-on-surface">{toast.message}</p>
      <button
        onClick={() => dismissToast(toast.id)}
        className="shrink-0 rounded p-0.5 text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
