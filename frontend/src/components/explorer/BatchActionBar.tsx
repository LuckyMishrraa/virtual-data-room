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
    batchDeleteAction,
    batchTagAction,
    currentUser,
  } = useVDRStore();

  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const isAuditor = currentUser.role === "Auditor";

  if (selectedFileIds.length < 2) return null;

  const SENSITIVITIES: SensitivityLevel[] = ["Confidential", "Restricted", "Internal Only", "Public"];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-blue-500/30 bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl">
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700 text-xs font-bold">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
            {selectedFileIds.length}
          </span>
          <span>Selected</span>
        </div>

        {/* Batch Sensitivity Update */}
        <div className="relative">
          <button
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            disabled={isAuditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-600 disabled:opacity-40 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Set Sensitivity</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isTagDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsTagDropdownOpen(false)}
              />
              <div className="absolute bottom-11 left-0 w-44 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-1.5 z-50 text-xs space-y-1">
                {SENSITIVITIES.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      batchTagAction(tag);
                      setIsTagDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors font-medium"
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
          onClick={() => {
            if (confirm(`Delete ${selectedFileIds.length} selected items permanently?`)) {
              batchDeleteAction();
            }
          }}
          disabled={isAuditor}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 disabled:opacity-40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete All</span>
        </button>

        {/* Clear Selection */}
        <button
          onClick={clearSelection}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
