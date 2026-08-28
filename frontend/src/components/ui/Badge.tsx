import React from "react";
import { SensitivityLevel } from "@/types/vdr";
import { cn, getSensitivityBadge } from "@/lib/utils";

interface SensitivityBadgeProps {
  sensitivity: SensitivityLevel;
  className?: string;
  showDot?: boolean;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({
  sensitivity,
  className,
  showDot = true,
}) => {
  const badge = getSensitivityBadge(sensitivity);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide shadow-xs transition-colors",
        badge.bg,
        badge.text,
        badge.border,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", badge.dot)} />}
      {badge.label}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: "low" | "medium" | "high"; className?: string }> = ({
  severity,
  className,
}) => {
  const config = {
    high: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800",
    medium: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    low: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800",
  }[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border",
        config,
        className
      )}
    >
      {severity}
    </span>
  );
};
