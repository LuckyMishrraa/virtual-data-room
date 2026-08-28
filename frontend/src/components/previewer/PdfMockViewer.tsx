"use client";

import React, { useState } from "react";
import { ComplianceFlag } from "@/types/vdr";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfMockViewerProps {
  fileName: string;
  complianceFlags: ComplianceFlag[];
  onSelectFlag?: (flag: ComplianceFlag) => void;
}

export const PdfMockViewer: React.FC<PdfMockViewerProps> = ({
  fileName,
  complianceFlags,
  onSelectFlag,
}) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-surface-raised/30 overflow-hidden">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between p-2.5 bg-surface border-b border-border text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="truncate max-w-[200px]">{fileName}</span>
        </div>

        {/* Page & Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-surface-raised disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-medium text-text-muted">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-surface-raised disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 15))}
              className="p-1 rounded hover:bg-surface-raised"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(180, z + 15))}
              className="p-1 rounded hover:bg-surface-raised"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 rounded hover:bg-surface-raised ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Mock Document Area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-900/40">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          className="w-[520px] min-h-[680px] p-8 rounded-xl shadow-2xl border border-slate-700 bg-white text-slate-900 flex flex-col justify-between transition-transform duration-150"
        >
          {/* Header Stamp */}
          <div>
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-6">
              <div>
                <h2 className="text-sm font-black tracking-wider uppercase text-slate-900">
                  Securities & Exchange Commission Filing
                </h2>
                <p className="text-[10px] text-slate-500 font-mono">
                  CONFIDENTIAL FORM 10-K // ACUMEN GLOBAL ASSETS
                </p>
              </div>
              <div className="border border-rose-600 px-2 py-1 text-[9px] font-extrabold text-rose-700 uppercase tracking-widest rounded">
                Strictly Confidential
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-4 text-[11px] leading-relaxed font-serif text-slate-800">
              <p>
                <strong>EXHIBIT 99.1 — MASTER FIDUCIARY DISCLOSURE</strong>
              </p>
              <p>
                This verified compliance prospectus represents the audited consolidation of portfolio assets, capital call reserves, and private equity investments under Management Regulation 402.
              </p>

              {/* Flagged Section Highlight 1 */}
              <div
                onClick={() => complianceFlags[0] && onSelectFlag && onSelectFlag(complianceFlags[0])}
                className="p-3 rounded-lg border border-rose-400 bg-rose-50 relative group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Compliance Flag: Material Exposure
                  </span>
                  <span className="text-[9px] font-mono bg-rose-200 text-rose-800 px-1.5 rounded">
                    SEC Rule 17a-4
                  </span>
                </div>
                <p className="text-rose-950 font-sans text-[10px]">
                  "Derivative hedging covenants with Sovereign Fund Alpha ($120M notional swap). Beneficiary accounts withheld per Schedule B confidentiality."
                </p>
              </div>

              <p>
                The General Partner certifies that reserve liquidity maintains a Tier 1 adequacy ratio of 16.4%, satisfying all Federal Reserve systemic risk requirements.
              </p>
            </div>
          </div>

          {/* Footer Signature & Watermark */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-sans">
            <span>Doc ID: VDR-2026-SEC-0914</span>
            <span className="font-mono">Page {page} of {totalPages}</span>
            <span>Verified by Chief Compliance Officer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
