import { cn } from "@/lib/utils";

interface TechBadgeProps {
  label: string;
  className?: string;
}

export function TechBadge({ label, className }: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800",
        className
      )}
    >
      {label}
    </span>
  );
}
