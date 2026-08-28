"use client";

import React from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { Home, ChevronRight, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs, navigateToFolder, files } = useVDRStore();

  return (
    <div className="flex items-center justify-between py-2.5 px-4 bg-surface/50 border-b border-border text-xs">
      {/* Path List */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id || "root"}>
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
              )}
              <button
                onClick={() => navigateToFolder(crumb.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors font-medium",
                  isLast
                    ? "bg-surface-raised text-text-primary font-bold shadow-2xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-raised/60"
                )}
              >
                {crumb.isRoot ? (
                  <Home className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>{crumb.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Item count badge */}
      <div className="text-[11px] font-semibold text-text-muted hidden sm:block">
        {files.length} {files.length === 1 ? "item" : "items"}
      </div>
    </div>
  );
};
