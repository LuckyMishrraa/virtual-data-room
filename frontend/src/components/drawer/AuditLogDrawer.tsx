"use client";

import React, { useState, useCallback } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { ActionType } from "@/types/vdr";
import { formatRelativeTime, formatDate, getRoleBadge, cn } from "@/lib/utils";
import { useModal } from "@/lib/useModal";
import {
  History,
  X,
  ShieldAlert,
  Upload,
  Eye,
  Download,
  Lock,
  Edit2,
  Trash2,
  Filter,
} from "lucide-react";

const ACTION_FILTERS = [
  "All",
  "Uploaded",
  "Viewed",
  "Downloaded",
  "Flagged",
  "Permission Changed",
  "Deleted",
];

export const AuditLogDrawer: React.FC = () => {
  const {
    isAuditDrawerOpen,
    toggleAuditDrawer,
    auditLogs,
    fetchAuditLogsAction,
  } = useVDRStore();

  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleClose = useCallback(() => {
    toggleAuditDrawer(false);
  }, [toggleAuditDrawer]);

  const dialogRef = useModal(isAuditDrawerOpen, handleClose);

  if (!isAuditDrawerOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const matchAction = selectedAction === "All" || log.action === selectedAction;
    const matchRole = !selectedRole || log.actor.role === selectedRole;
    return matchAction && matchRole;
  });

  const getActionBadge = (action: ActionType) => {
    switch (action) {
      case "Uploaded":
        return {
          icon: <Upload className="w-3.5 h-3.5" />,
          classes: "bg-accent/15 text-accent dark:text-accent-light border-accent/30 dark:border-accent/40",
        };
      case "Flagged":
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          classes: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800",
        };
      case "Permission Changed":
        return {
          icon: <Lock className="w-3.5 h-3.5" />,
          classes: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800",
        };
      case "Viewed":
        return {
          icon: <Eye className="w-3.5 h-3.5" />,
          classes: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
        };
      case "Downloaded":
        return {
          icon: <Download className="w-3.5 h-3.5" />,
          classes: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800",
        };
      case "Renamed":
        return {
          icon: <Edit2 className="w-3.5 h-3.5" />,
          classes: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800",
        };
      case "Deleted":
        return {
          icon: <Trash2 className="w-3.5 h-3.5" />,
          classes: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800",
        };
      default:
        return {
          icon: <History className="w-3.5 h-3.5" />,
          classes: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => toggleAuditDrawer(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-drawer-title"
          tabIndex={-1}
          className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-border bg-surface-raised/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sev-3-bg text-sev-1 border border-sev-3-line">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 id="audit-drawer-title" className="text-sm font-bold text-text-primary">
                  Activity Audit Trail
                </h3>
                <p className="text-[11px] text-text-muted">
                  Immutable chronological compliance timeline
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleAuditDrawer(false)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Bar */}
          <div className="p-4 border-b border-border space-y-3 bg-surface text-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {ACTION_FILTERS.map((act) => (
                <button
                  key={act}
                  onClick={() => setSelectedAction(act)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border",
                    selectedAction === act
                      ? "bg-text-primary text-page border-text-primary"
                      : "bg-surface text-text-secondary border-border hover:bg-surface-raised"
                  )}
                >
                  {act}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Role:</span>
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-border bg-surface-raised text-text-primary text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Compliance Officer">Compliance Officer</option>
                <option value="Advisor">Advisor</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>
          </div>

          {/* Timeline Events List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 text-text-muted">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No audit events match criteria</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const roleBadge = getRoleBadge(log.actor.role);

                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline Dot Icon */}
                      <div
                        className={cn(
                          "absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-surface shadow-xs transition-transform group-hover:scale-110",
                          badge.classes
                        )}
                      >
                        {badge.icon}
                      </div>

                      {/* Content Card */}
                      <div className="rounded-xl border border-border bg-surface-raised/40 p-3 space-y-2 hover:border-border-strong hover:bg-surface-raised transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border",
                              badge.classes
                            )}
                          >
                            {log.action}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono" title={formatDate(log.timestamp)}>
                            {formatRelativeTime(log.timestamp)}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-text-primary break-all">
                            {log.fileName}
                          </p>
                          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                            {log.details}
                          </p>
                        </div>

                        {/* Actor Footnote */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={log.actor.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                              alt={log.actor.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="font-semibold text-text-primary text-[11px]">
                              {log.actor.name}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "px-1.5 py-0.2 rounded text-[9px] font-bold border",
                              roleBadge.badgeClass
                            )}
                          >
                            {log.actor.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
