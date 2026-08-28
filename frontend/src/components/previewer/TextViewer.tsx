"use client";

import React from "react";
import { ComplianceFlag } from "@/types/vdr";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextViewerProps {
  content: string;
  complianceFlags: ComplianceFlag[];
  onSelectFlag?: (flag: ComplianceFlag) => void;
}

export const TextViewer: React.FC<TextViewerProps> = ({
  content,
  complianceFlags,
  onSelectFlag,
}) => {
  const lines = content.split("\n");

  return (
    <div className="font-mono text-xs leading-relaxed overflow-x-auto select-text p-4 bg-surface-raised/40 rounded-xl border border-border">
      {lines.map((line, index) => {
        const lineNum = index + 1;
        
        // Find if this line has an active compliance flag matching keywords
        const matchingFlag = complianceFlags.find((f) => {
          const sectionKey = f.lineOrSection.toLowerCase();
          return (
            line.toLowerCase().includes(sectionKey) ||
            (sectionKey.includes("section 4") && line.toLowerCase().includes("section 4")) ||
            (sectionKey.includes("clause 12") && line.toLowerCase().includes("clause 12")) ||
            (sectionKey.includes("schedule b") && line.toLowerCase().includes("schedule b"))
          );
        });

        return (
          <div
            key={index}
            className={cn(
              "flex items-start gap-4 py-0.5 px-2 rounded-md transition-colors group",
              matchingFlag
                ? matchingFlag.severity === "high"
                  ? "bg-rose-500/15 border-l-2 border-rose-500"
                  : "bg-amber-500/15 border-l-2 border-amber-500"
                : "hover:bg-surface-raised"
            )}
          >
            {/* Line Number */}
            <span className="w-8 shrink-0 text-right text-text-muted select-none text-[11px]">
              {lineNum}
            </span>

            {/* Line Content with Flag Trigger */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span
                className={cn(
                  "break-all",
                  matchingFlag
                    ? matchingFlag.severity === "high"
                      ? "text-rose-700 dark:text-rose-300 font-semibold"
                      : "text-amber-800 dark:text-amber-300 font-semibold"
                    : "text-text-primary"
                )}
              >
                {line || " "}
              </span>

              {matchingFlag && (
                <button
                  onClick={() => onSelectFlag && onSelectFlag(matchingFlag)}
                  className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500 text-white shadow-xs hover:bg-rose-600 transition-colors"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>Flagged ({matchingFlag.severity})</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
