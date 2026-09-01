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

// Single disciplined rose/crimson severity family (replaces the old
// rose/amber/indigo/emerald four-hue badge system): Confidential and Restricted are
// solid flat fills at two intensities, Internal Only is a tinted third step, and
// Public deliberately carries no color of its own — it reuses the app's neutral
// text-muted/border tokens, signaling "no classification concern" by absence.
//
// Confidential is additionally the one tier that breaks from the pill shape (rounded-md
// instead of rounded-full, plus a color-matched shadow) — severity is encoded through
// shape and weight as well as color, so the highest tier reads as "declared," not just
// "differently colored." Restricted/Internal/Public stay pill-shaped and calmer.
export function getSensitivityBadge(sensitivity: SensitivityLevel) {
  switch (sensitivity) {
    case "Confidential":
      return {
        label: "Confidential",
        bg: "bg-sev-1 rounded-md",
        text: "text-white font-extrabold tracking-wide",
        border: "border-sev-1",
        dot: "bg-white",
        accentGlow: "shadow-md shadow-sev-1/35",
      };
    case "Restricted":
      return {
        label: "Restricted",
        bg: "bg-sev-2",
        text: "text-white font-extrabold tracking-wide",
        border: "border-sev-2",
        dot: "bg-white",
        accentGlow: "shadow-sm shadow-sev-2/20",
      };
    case "Internal Only":
      return {
        label: "Internal Only",
        bg: "bg-sev-3-bg",
        text: "text-sev-3-ink font-bold",
        border: "border-sev-3-line",
        dot: "bg-sev-3-ink",
        accentGlow: "",
      };
    case "Public":
      return {
        label: "Public",
        bg: "bg-transparent",
        text: "text-text-muted",
        border: "border-border-strong",
        dot: "bg-text-muted",
        accentGlow: "",
      };
    default:
      return {
        label: sensitivity,
        bg: "bg-transparent",
        text: "text-text-muted",
        border: "border-border-strong",
        dot: "bg-text-muted",
        accentGlow: "",
      };
  }
}

// Role badges no longer carry a distinct hue per role (that was the same "five
// competing colors" problem as the old sensitivity ramp, just applied to personas).
// One consistent accent-tinted treatment for all roles; the label text differentiates.
export function getRoleBadge(role: UserRole) {
  const badgeClass = "bg-accent/10 text-accent dark:text-accent-light border-accent/25";
  switch (role) {
    case "Admin":
      return { label: "Admin", badgeClass };
    case "Compliance Officer":
      return { label: "Compliance Officer", badgeClass };
    case "Advisor":
      return { label: "Advisor", badgeClass };
    case "Auditor":
      return { label: "Auditor (Read-Only)", badgeClass };
  }
}
