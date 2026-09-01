"use client";

import React, { useCallback } from "react";
import { ComplianceFlag } from "@/types/vdr";
import { SeverityBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useModal } from "@/lib/useModal";
import { ShieldAlert, CheckCircle2, X } from "lucide-react";

interface ComplianceFlagInspectorProps {
  flag: ComplianceFlag | null;
  fileId: string;
  onClose: () => void;
  onResolve: (flagId: string) => void;
  canResolve: boolean;
}

export const ComplianceFlagInspector: React.FC<ComplianceFlagInspectorProps> = ({
  flag,
  fileId,
  onClose,
  onResolve,
  canResolve,
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const dialogRef = useModal(!!flag, handleClose);

  if (!flag) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flag-inspector-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sev-1/10 text-sev-1 border border-sev-1/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 id="flag-inspector-title" className="text-sm font-bold text-text-primary">
                Compliance Risk Inspection
              </h3>
              <p className="text-[11px] text-text-muted">
                Flag ID: {flag.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Flag Details Card */}
        <div className="p-4 rounded-xl border border-border bg-surface-raised/50 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-secondary">Severity:</span>
            <SeverityBadge severity={flag.severity} />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-secondary">Target Section:</span>
            <span className="font-mono text-text-primary font-bold">{flag.lineOrSection}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-secondary">Flagged Date:</span>
            <span className="text-text-muted">{formatDate(flag.timestamp)}</span>
          </div>

          <div className="pt-2 border-t border-border">
            <span className="font-semibold text-text-secondary block mb-1">Violation Description:</span>
            <p className="text-text-primary leading-relaxed bg-surface p-2.5 rounded-lg border border-border">
              {flag.reason}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-raised text-text-secondary"
          >
            Dismiss
          </button>

          {canResolve && (
            <button
              onClick={() => {
                onResolve(flag.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-success hover:brightness-90 text-white shadow-md shadow-success/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
