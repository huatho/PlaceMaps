import type { ReviewStatus } from "@/types/review";

interface StatusBadgeProps {
  status: ReviewStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles =
    status === "Resolved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}
