import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Card<T extends ElementType = "div">({ as, children, className, ...props }: CardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component className={cn("rounded-lg border border-slate-200 bg-white shadow-soft", className)} {...props}>
      {children}
    </Component>
  );
}
