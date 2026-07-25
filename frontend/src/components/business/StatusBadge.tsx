import { cn } from "@/lib/utils";

const variantMap: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  no_show: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  available: "bg-green-500/10 text-green-400 border-green-500/20",
  booked: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = variantMap[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        colors,
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
