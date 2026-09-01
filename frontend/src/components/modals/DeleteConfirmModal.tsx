"use client";

import React, { useState, useCallback } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { useModal } from "@/lib/useModal";
import { Trash2, X, AlertTriangle } from "lucide-react";

export const DeleteConfirmModal: React.FC = () => {
  const {
    deleteTarget,
    setDeleteTarget,
    deleteFileAction,
    isBatchDeleteConfirmOpen,
    toggleBatchDeleteConfirm,
    selectedFileIds,
    batchDeleteAction,
  } = useVDRStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const isBatchMode = isBatchDeleteConfirmOpen;
  const isOpen = !!deleteTarget || isBatchMode;
  const itemCount = selectedFileIds.length;

  const handleClose = useCallback(() => {
    if (isBatchMode) {
      toggleBatchDeleteConfirm(false);
    } else {
      setDeleteTarget(null);
    }
  }, [isBatchMode, toggleBatchDeleteConfirm, setDeleteTarget]);

  const dialogRef = useModal(isOpen, handleClose);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    if (isBatchMode) {
      await batchDeleteAction();
      toggleBatchDeleteConfirm(false);
    } else if (deleteTarget) {
      await deleteFileAction(deleteTarget.id);
    }
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-sev-1/30 bg-surface shadow-2xl p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sev-1/15 text-sev-1 border border-sev-1/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="delete-confirm-title" className="text-sm font-bold text-text-primary">
                Confirm Deletion
              </h3>
              <p className="text-[11px] text-text-muted">
                Permanent removal from VDR & MinIO
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-sev-1/5 border border-sev-1/20 text-xs space-y-1.5">
          <p className="text-text-primary font-medium leading-relaxed">
            Are you sure you want to permanently delete:
          </p>
          {isBatchMode ? (
            <p className="font-bold text-sev-1 font-mono">
              {itemCount} selected item{itemCount === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="font-bold text-sev-1 break-all font-mono">
              {deleteTarget?.name}
            </p>
          )}
          {(isBatchMode || deleteTarget?.isFolder) && (
            <p className="text-[11px] text-text-muted pt-1">
              ⚠️ Warning: All nested files and sub-folders within {isBatchMode ? "these items" : "this directory"} will also be deleted.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-raised text-text-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-sev-1 hover:brightness-90 text-white shadow-md shadow-sev-1/20 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
