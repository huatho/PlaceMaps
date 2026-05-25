import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-400",
  secondary:
    "border border-slate-300 bg-white text-slate-800 hover:border-slate-950 hover:bg-slate-950 hover:text-white disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300"
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed",
        "whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
