import { cn } from "@/lib/utils";

interface TechBadgeProps {
  label: string;
  className?: string;
}

export function TechBadge({ label, className }: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700",
        className
      )}
    >
      {label}
    </span>
  );
}
