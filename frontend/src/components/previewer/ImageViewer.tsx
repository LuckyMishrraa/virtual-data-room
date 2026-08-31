"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ImageViewerProps {
  fileId: string;
  fileName: string;
  sizeBytes: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  fileId,
  fileName,
  sizeBytes,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageUrl = `http://localhost:8000/api/v1/files/${fileId}/content`;

  const handleZoomIn = () => setZoom((z) => Math.min(250, z + 20));
  const handleZoomOut = () => setZoom((z) => Math.max(30, z - 20));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleDownload = () => {
    window.open(`http://localhost:8000/api/v1/files/${fileId}/content`, "_blank");
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl border border-border bg-surface-raised/40 overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 bg-black/95 rounded-none border-none p-4" : "h-[540px]"
        }`}
    >
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between p-2.5 bg-surface/90 backdrop-blur-md border-b border-border text-xs z-10">
        <div className="flex items-center gap-2 min-w-0">
          <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="font-semibold text-text-primary truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
          <span className="text-[10px] text-text-muted">({formatBytes(sizeBytes)})</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-lg hover:bg-surface-raised text-text-secondary"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono w-10 text-center text-text-primary">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-lg hover:bg-surface-raised text-text-secondary"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            onClick={handleRotate}
            className="p-1 rounded-lg hover:bg-surface-raised text-text-secondary"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded-lg hover:bg-surface-raised text-text-secondary text-[11px] font-semibold"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded-lg hover:bg-surface-raised text-text-secondary"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/40 select-none">
        {isLoading && !hasError && (
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs">Loading image stream from MinIO...</span>
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center text-text-muted">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-xs font-semibold text-text-primary">Unable to display image preview</p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
            className="flex items-center justify-center max-w-full max-h-full"
          >
            <img
              src={imageUrl}
              alt={fileName}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className={`max-w-full max-h-[460px] object-contain rounded-lg shadow-2xl transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"
                }`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
