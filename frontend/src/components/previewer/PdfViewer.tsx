"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface PdfViewerProps {
  fileId: string;
  fileName: string;
  sizeBytes: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  fileId,
  fileName,
  sizeBytes,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfUrl = `${API_BASE_URL}/files/${fileId}/content`;

  const handleOpenExternal = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl border border-border bg-surface-raised/40 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 bg-black/95 rounded-none border-none p-4" : "h-[560px]"
      }`}
    >
      {/* PDF Header Toolbar */}
      <div className="flex items-center justify-between p-2.5 bg-surface/90 backdrop-blur-md border-b border-border text-xs z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-surface-raised text-text-muted border border-border">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-semibold text-text-primary truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
          <span className="text-[10px] text-text-muted">({formatBytes(sizeBytes)})</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-secondary text-[11px] font-semibold transition-colors"
            title="Open in new window / full tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Open in Tab</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-secondary transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Embedded Live PDF Document Frame */}
      <div className="flex-1 bg-slate-900 flex flex-col">
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full min-h-[460px] border-none"
        >
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={fileName}
            className="w-full h-full min-h-[460px] border-none"
          >
            <div className="p-8 text-center text-text-muted flex flex-col items-center justify-center h-full">
              <FileText className="w-12 h-12 text-text-muted mb-3" />
              <p className="text-sm font-bold text-text-primary">PDF Preview Engine</p>
              <p className="text-xs text-text-secondary mt-1 mb-4">
                Your browser is unable to render embedded PDF inline.
              </p>
              <button
                onClick={handleOpenExternal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-semibold shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Tab</span>
              </button>
            </div>
          </iframe>
        </object>
      </div>
    </div>
  );
};
