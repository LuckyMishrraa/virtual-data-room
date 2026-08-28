"use client";

import React, { useState } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { Trash2, X, AlertTriangle } from "lucide-react";

export const DeleteConfirmModal: React.FC = () => {
  const { deleteTarget, setDeleteTarget, deleteFileAction } = useVDRStore();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!deleteTarget) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteFileAction(deleteTarget.id);
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-surface shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Confirm Deletion
              </h3>
              <p className="text-[11px] text-text-muted">
                Permanent removal from VDR & MinIO
              </p>
            </div>
          </div>
          <button
            onClick={() => setDeleteTarget(null)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-1.5">
          <p className="text-text-primary font-medium leading-relaxed">
            Are you sure you want to permanently delete:
          </p>
          <p className="font-bold text-rose-600 dark:text-rose-400 break-all font-mono">
            {deleteTarget.name}
          </p>
          {deleteTarget.isFolder && (
            <p className="text-[11px] text-text-muted pt-1">
              ⚠️ Warning: All nested files and sub-folders within this directory will also be deleted.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-raised text-text-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
