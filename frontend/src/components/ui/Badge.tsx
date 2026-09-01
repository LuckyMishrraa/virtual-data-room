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
        "inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-xs font-semibold border tracking-wide shadow-xs transition-colors truncate max-w-full",
        badge.bg,
        badge.text,
        badge.border,
        badge.accentGlow,
        className
      )}
      title={badge.label}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", badge.dot)} />}
      <span className="truncate">{badge.label}</span>
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: "low" | "medium" | "high"; className?: string }> = ({
  severity,
  className,
}) => {
  const config = {
    high: "bg-sev-1/15 text-sev-1 dark:text-sev-2 border-sev-1/30",
    medium: "bg-sev-2/15 text-sev-2 dark:text-sev-3-ink border-sev-2/30",
    low: "bg-accent/10 text-accent dark:text-accent-light border-accent/25",
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
