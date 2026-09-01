"use client";

import React, { useState } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { SensitivityLevel } from "@/types/vdr";
import {
  Layers,
  Trash2,
  Lock,
  X,
  ChevronUp,
} from "lucide-react";

export const BatchActionBar: React.FC = () => {
  const {
    selectedFileIds,
    clearSelection,
    toggleBatchDeleteConfirm,
    batchTagAction,
    currentUser,
  } = useVDRStore();

  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const canManage = currentUser.role === "Admin" || currentUser.role === "Compliance Officer";

  if (selectedFileIds.length < 2) return null;

  const SENSITIVITIES: SensitivityLevel[] = ["Confidential", "Restricted", "Internal Only", "Public"];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-accent/20 bg-surface-overlay/80 text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_1px_rgba(20,24,40,0.06),0_20px_42px_-14px_rgba(30,35,70,0.45)] backdrop-blur-xl backdrop-saturate-150">
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-3 border-r border-border text-xs font-extrabold tracking-tight">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-white text-xs font-extrabold shadow-[0_1px_2px_rgba(33,64,189,0.3),0_4px_10px_-3px_rgba(33,64,189,0.6)]">
            {selectedFileIds.length}
          </span>
          <span>Selected</span>
        </div>

        {/* Batch Sensitivity Update */}
        <div className="relative">
          <button
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            disabled={!canManage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-raised text-xs font-bold border border-border disabled:opacity-40 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span>Set Sensitivity</span>
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          </button>

          {isTagDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsTagDropdownOpen(false)}
              />
              <div className="absolute bottom-11 left-0 w-44 rounded-xl border border-border bg-surface shadow-2xl p-1.5 z-50 text-xs space-y-1">
                {SENSITIVITIES.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      batchTagAction(tag);
                      setIsTagDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-surface-raised transition-colors font-medium text-text-primary"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Batch Delete Button */}
        <button
          onClick={() => toggleBatchDeleteConfirm(true)}
          disabled={!canManage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sev-1/10 hover:bg-sev-1/20 text-sev-1 text-xs font-bold border border-sev-1/30 disabled:opacity-40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete All</span>
        </button>

        {/* Clear Selection */}
        <button
          onClick={clearSelection}
          className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
