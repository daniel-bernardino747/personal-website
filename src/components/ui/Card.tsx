import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
