"use client";

import React, { useState, useEffect } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { Edit2, X } from "lucide-react";

export const RenameModal: React.FC = () => {
  const { renameTarget, setRenameTarget, renameFileAction } = useVDRStore();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (renameTarget) {
      setName(renameTarget.name);
    }
  }, [renameTarget]);

  if (!renameTarget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    await renameFileAction(renameTarget.id, name.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Rename {renameTarget.isFolder ? "Folder" : "Document"}
              </h3>
              <p className="text-[11px] text-text-muted">
                Original: <span className="font-semibold text-text-primary">{renameTarget.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setRenameTarget(null)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              New Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-border bg-surface-raised text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setRenameTarget(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-raised text-text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name === renameTarget.name || isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-40"
            >
              {isSubmitting ? "Renaming..." : "Save Name"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
