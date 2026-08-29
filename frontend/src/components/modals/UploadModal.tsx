"use client";

import React, { useState, useRef } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { SensitivityLevel } from "@/types/vdr";
import { formatBytes, cn } from "@/lib/utils";
import {
  Upload,
  X,
  FileText,
  Lock,
} from "lucide-react";

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    toggleUploadModal,
    uploadFileAction,
    currentFolderName,
    addToast,
  } = useVDRStore();

  const [files, setFiles] = useState<File[]>([]);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("Internal Only");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const validateAndAddFiles = (incoming: File[]) => {
    const valid: File[] = [];
    for (const f of incoming) {
      if (f.size > 50 * 1024 * 1024) {
        addToast({
          type: "error",
          title: "File Exceeds 50MB Limit",
          message: `${f.name} is too large for secure ingestion.`,
        });
      } else {
        valid.push(f);
      }
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFileFromQueue = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (!files.length) return;
    setIsUploading(true);
    setUploadProgress(10);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round(((i + 1) / files.length) * 80));
      await uploadFileAction(file, sensitivity);
    }

    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setFiles([]);
      toggleUploadModal(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Upload Documents to VDR
              </h3>
              <p className="text-[11px] text-text-muted">
                Destination: <span className="font-semibold text-text-primary">{currentFolderName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleUploadModal(false)}
            disabled={isUploading}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sensitivity Level Configuration */}
        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            Default Security Classification
          </label>
          <select
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
            className="w-full h-9 px-3 rounded-xl border border-border bg-surface-raised text-text-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="Internal Only">Internal Only (Default)</option>
            <option value="Confidential">Confidential (High Security)</option>
            <option value="Restricted">Restricted (Covenants/Agreements)</option>
            <option value="Public">Public (Disclosures & Overviews)</option>
          </select>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all",
            isDragging
              ? "border-blue-500 bg-blue-500/10 scale-[0.99]"
              : "border-border hover:border-blue-500/60 hover:bg-surface-raised/40"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 animate-bounce" />
          </div>
          <p className="text-xs font-bold text-text-primary">
            Drag & drop financial documents here, or <span className="text-blue-500 underline">browse</span>
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            Supports PDF, Markdown, Text, JSON, CSV, and PNG/JPG (Max 50MB)
          </p>
        </div>

        {/* Queue List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <p className="text-[11px] font-bold text-text-muted uppercase">
              Upload Queue ({files.length})
            </p>
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-surface-raised border border-border text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate font-semibold text-text-primary">{file.name}</span>
                  <span className="text-[10px] text-text-muted shrink-0">
                    ({formatBytes(file.size)})
                  </span>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => removeFileFromQueue(i)}
                    className="p-1 text-text-muted hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Uploading Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 animate-in fade-in">
            <div className="flex justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Streaming to MinIO S3 Object Storage...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="bg-blue-600 h-full rounded-full transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => toggleUploadModal(false)}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-surface-raised text-text-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={!files.length || isUploading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-40"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? "Uploading..." : `Upload ${files.length} File(s)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
