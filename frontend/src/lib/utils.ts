import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SensitivityLevel, UserRole } from "@/types/vdr";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Just now";
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 45) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDate(isoString);
  } catch {
    return "Just now";
  }
}

export function getSensitivityBadge(sensitivity: SensitivityLevel) {
  switch (sensitivity) {
    case "Confidential":
      return {
        label: "Confidential",
        bg: "bg-rose-500/10 dark:bg-rose-500/20",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-300 dark:border-rose-800/60",
        dot: "bg-rose-500",
        accentGlow: "shadow-rose-500/10",
      };
    case "Restricted":
      return {
        label: "Restricted",
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-800 dark:text-amber-300",
        border: "border-amber-300 dark:border-amber-800/60",
        dot: "bg-amber-500",
        accentGlow: "shadow-amber-500/10",
      };
    case "Internal Only":
      return {
        label: "Internal Only",
        bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
        text: "text-indigo-700 dark:text-indigo-300",
        border: "border-indigo-300 dark:border-indigo-800/60",
        dot: "bg-indigo-500",
        accentGlow: "shadow-indigo-500/10",
      };
    case "Public":
      return {
        label: "Public",
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-300 dark:border-emerald-800/60",
        dot: "bg-emerald-500",
        accentGlow: "shadow-emerald-500/10",
      };
    default:
      return {
        label: sensitivity,
        bg: "bg-slate-500/10",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-300 dark:border-slate-700",
        dot: "bg-slate-400",
        accentGlow: "",
      };
  }
}

export function getRoleBadge(role: UserRole) {
  switch (role) {
    case "Admin":
      return {
        label: "Admin",
        badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800",
      };
    case "Compliance Officer":
      return {
        label: "Compliance Officer",
        badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800",
      };
    case "Advisor":
      return {
        label: "Advisor",
        badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      };
    case "Auditor":
      return {
        label: "Auditor (Read-Only)",
        badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      };
  }
}
