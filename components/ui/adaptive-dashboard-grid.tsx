import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DashboardCardSize = "small" | "medium" | "large";

interface AdaptiveDashboardGridProps {
  children: ReactNode;
  className?: string;
}

interface AdaptiveDashboardCardProps {
  children: ReactNode;
  className?: string;
  size?: DashboardCardSize;
}

const cardSizeClasses: Record<DashboardCardSize, string> = {
  small: "md:col-span-1 xl:col-span-1",
  medium: "md:col-span-2 xl:col-span-2",
  large: "md:col-span-2 xl:col-span-3",
};

export function AdaptiveDashboardGrid({ children, className }: AdaptiveDashboardGridProps) {
  return (
    <div className={cn("grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function AdaptiveDashboardCard({
  children,
  className,
  size = "small",
}: AdaptiveDashboardCardProps) {
  return <div className={cn("min-w-0", cardSizeClasses[size], className)}>{children}</div>;
}
