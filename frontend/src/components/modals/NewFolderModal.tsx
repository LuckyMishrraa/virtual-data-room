"use client";

import React, { useState } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { SensitivityLevel } from "@/types/vdr";
import { FolderPlus, X } from "lucide-react";

export const NewFolderModal: React.FC = () => {
  const {
    isNewFolderModalOpen,
    toggleNewFolderModal,
    createFolderAction,
    currentFolderName,
  } = useVDRStore();

  const [folderName, setFolderName] = useState("");
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("Internal Only");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewFolderModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsSubmitting(true);
    const ok = await createFolderAction(folderName.trim(), sensitivity);
    setIsSubmitting(false);
    if (ok) {
      setFolderName("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Create New Folder</h3>
              <p className="text-[11px] text-text-muted">
                Inside: <span className="font-semibold text-text-primary">{currentFolderName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleNewFolderModal(false)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Folder Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. 2026 Audit Deliverables"
              className="w-full h-9 px-3 rounded-xl border border-border bg-surface-raised text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Security Classification
            </label>
            <select
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
              className="w-full h-9 px-3 rounded-xl border border-border bg-surface-raised text-text-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="Internal Only">Internal Only</option>
              <option value="Confidential">Confidential</option>
              <option value="Restricted">Restricted</option>
              <option value="Public">Public</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => toggleNewFolderModal(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-raised text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-40"
            >
              {isSubmitting ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
