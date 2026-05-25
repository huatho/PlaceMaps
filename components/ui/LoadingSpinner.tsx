import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <span
      className={cn("size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700", className)}
      aria-hidden="true"
    />
  );
}
