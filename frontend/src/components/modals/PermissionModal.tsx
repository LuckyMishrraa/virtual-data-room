"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { RolePermissions, UserRole } from "@/types/vdr";
import { useModal } from "@/lib/useModal";
import { Lock, X, Check, ShieldCheck } from "lucide-react";
import { getRoleBadge } from "@/lib/utils";

const ROLES: UserRole[] = ["Admin", "Compliance Officer", "Advisor", "Auditor"];

export const PermissionModal: React.FC = () => {
  const { permissionTarget, setPermissionTarget, updatePermissionsAction } = useVDRStore();
  const [permissions, setPermissions] = useState<Record<UserRole, RolePermissions>>({
    Admin: { canView: true, canEdit: true, canShare: true },
    "Compliance Officer": { canView: true, canEdit: true, canShare: true },
    Advisor: { canView: true, canEdit: false, canShare: false },
    Auditor: { canView: true, canEdit: false, canShare: false },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (permissionTarget?.permissions) {
      setPermissions({
        Admin: permissionTarget.permissions.Admin || { canView: true, canEdit: true, canShare: true },
        "Compliance Officer": permissionTarget.permissions["Compliance Officer"] || { canView: true, canEdit: true, canShare: true },
        Advisor: permissionTarget.permissions.Advisor || { canView: true, canEdit: false, canShare: false },
        Auditor: permissionTarget.permissions.Auditor || { canView: true, canEdit: false, canShare: false },
      });
    }
  }, [permissionTarget]);

  const handleClose = useCallback(() => {
    setPermissionTarget(null);
  }, [setPermissionTarget]);

  const dialogRef = useModal(!!permissionTarget, handleClose);

  if (!permissionTarget) return null;

  const toggleRight = (role: UserRole, right: keyof RolePermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [right]: !prev[role][right],
      },
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await updatePermissionsAction(permissionTarget.id, permissions);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-modal-title"
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-accent/10 text-violet-accent border border-violet-accent/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="permission-modal-title" className="text-sm font-bold text-text-primary">
                Role-Based Access Control (RBAC)
              </h3>
              <p className="text-[11px] text-text-muted truncate max-w-xs">
                Target: <span className="font-semibold text-text-primary">{permissionTarget.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setPermissionTarget(null)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-secondary">
          Configure granular view, edit, and sharing rights for each institutional role.
        </p>

        {/* 4x3 Matrix Table */}
        <div className="rounded-xl border border-border overflow-hidden bg-surface">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-raised text-text-muted uppercase text-[10px] border-b border-border">
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 text-center font-bold">View Rights</th>
                <th className="py-3 px-4 text-center font-bold">Edit Rights</th>
                <th className="py-3 px-4 text-center font-bold">Share Rights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ROLES.map((role) => {
                const roleBadge = getRoleBadge(role);
                const perm = permissions[role];

                return (
                  <tr key={role} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleBadge.badgeClass}`}>
                        {role}
                      </span>
                    </td>

                    {/* View Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleRight(role, "canView")}
                        className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center transition-all ${
                          perm.canView ? "bg-success border-success text-white" : "border-border bg-surface"
                        }`}
                      >
                        {perm.canView && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Edit Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleRight(role, "canEdit")}
                        className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center transition-all ${
                          perm.canEdit ? "bg-accent border-accent text-white" : "border-border bg-surface"
                        }`}
                      >
                        {perm.canEdit && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Share Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleRight(role, "canShare")}
                        className={`w-5 h-5 mx-auto rounded-md border flex items-center justify-center transition-all ${
                          perm.canShare ? "bg-violet-accent border-violet-accent text-white" : "border-border bg-surface"
                        }`}
                      >
                        {perm.canShare && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-[11px] text-accent dark:text-accent-light">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Updates immediately take effect and log an immutable audit event.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setPermissionTarget(null)}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-raised text-text-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-accent hover:brightness-90 text-white shadow-md disabled:opacity-40"
          >
            {isSubmitting ? "Applying..." : "Save Permission Matrix"}
          </button>
        </div>
      </div>
    </div>
  );
};
