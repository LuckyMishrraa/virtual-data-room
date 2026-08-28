"use client";

import React from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { SensitivityLevel, SortField } from "@/types/vdr";
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  Search,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SENSITIVITY_PILLS: { label: string; value: string; color: string }[] = [
  { label: "All", value: "", color: "border-border" },
  { label: "Confidential", value: "Confidential", color: "hover:border-rose-500 hover:text-rose-500" },
  { label: "Restricted", value: "Restricted", color: "hover:border-amber-500 hover:text-amber-500" },
  { label: "Internal", value: "Internal Only", color: "hover:border-indigo-500 hover:text-indigo-500" },
  { label: "Public", value: "Public", color: "hover:border-emerald-500 hover:text-emerald-500" },
];

const FILE_TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "PDF Documents (.pdf)", value: ".pdf" },
  { label: "Markdown (.md)", value: ".md" },
  { label: "Text Files (.txt)", value: ".txt" },
  { label: "JSON Data (.json)", value: ".json" },
  { label: "Images (.png / .jpg)", value: ".png" },
];

export const ExplorerToolbar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sensitivityFilter,
    setSensitivityFilter,
    fileTypeFilter,
    setFileTypeFilter,
    sortBy,
    sortOrder,
    setSort,
  } = useVDRStore();

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-border bg-surface">
      {/* Top Row: Search on mobile + Filters + Sort + View Mode */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Mobile Search */}
        <div className="relative flex-1 min-w-[200px] md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-surface-raised border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Sensitivity Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {SENSITIVITY_PILLS.map((pill) => {
            const isSelected = sensitivityFilter === pill.value;
            return (
              <button
                key={pill.label}
                onClick={() => setSensitivityFilter(pill.value)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-lg border transition-all shadow-2xs",
                  isSelected
                    ? "bg-text-primary text-page border-text-primary"
                    : "bg-surface text-text-secondary border-border hover:bg-surface-raised",
                  pill.color
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Right Action Cluster: File Type + Sort + View Mode Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          {/* File Type Dropdown */}
          <div className="relative">
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="h-8 pl-2.5 pr-7 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none"
            >
              {FILE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split("-") as [SortField, "asc" | "desc"];
                setSort(f, o);
              }}
              className="h-8 pl-2.5 pr-7 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none"
            >
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="date-desc">Date Modified (Newest)</option>
              <option value="date-asc">Date Modified (Oldest)</option>
              <option value="size-desc">Size (Largest)</option>
              <option value="size-asc">Size (Smallest)</option>
              <option value="sensitivity-desc">Sensitivity (Highest)</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="h-4 w-px bg-border hidden xs:block" />

          {/* Grid vs Table View Mode */}
          <div className="flex items-center rounded-lg border border-border bg-surface-raised p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "grid"
                  ? "bg-surface text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "table"
                  ? "bg-surface text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
