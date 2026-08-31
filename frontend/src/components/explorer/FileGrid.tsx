"use client";

import React, { useState } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { VDRFile, UserRole } from "@/types/vdr";
import { SensitivityBadge } from "@/components/ui/Badge";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import {
  Folder,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
  ShieldAlert,
  MoreVertical,
  Download,
  Edit2,
  Lock,
  Trash2,
  Eye,
  Check,
  Plus,
  Upload,
} from "lucide-react";
import { vdrApi } from "@/lib/api/vdrApi";

export const FileGrid: React.FC = () => {
  const {
    files,
    selectedFile,
    selectedFileIds,
    isPreviewOpen,
    toggleFileSelection,
    selectFile,
    currentUser,
    setRenameTarget,
    setPermissionTarget,
    setDeleteTarget,
    toggleUploadModal,
    toggleNewFolderModal,
    addToast,
  } = useVDRStore();

  const canManage = currentUser.role === "Admin" || currentUser.role === "Compliance Officer";

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center my-8">
        <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-text-muted mb-4 shadow-sm">
          <Folder className="w-8 h-8 text-blue-500/60" />
        </div>
        <h3 className="text-base font-bold text-text-primary">This folder is empty</h3>
        <p className="text-xs text-text-secondary max-w-sm mt-1">
          Upload disclosures, financial statements, or capitalization tables to get started.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => toggleUploadModal(true)}
            disabled={!canManage}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-40"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => toggleNewFolderModal(true)}
            disabled={!canManage}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-primary disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>New Folder</span>
          </button>
        </div>
      </div>
    );
  }

  const visibleFiles = files.filter(
    (file) => file.permissions?.[currentUser.role]?.canView !== false
  );

  if (visibleFiles.length === 0 && files.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center my-8">
        <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-text-muted mb-4 shadow-sm">
          <Lock className="w-8 h-8 text-amber-500/60" />
        </div>
        <h3 className="text-base font-bold text-text-primary">Access Restricted</h3>
        <p className="text-xs text-text-secondary max-w-sm mt-1">
          Your role ({currentUser.role}) does not have clearance to view documents in this folder.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 p-4 transition-all duration-200",
        isPreviewOpen
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}
    >
      {visibleFiles.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          userRole={currentUser.role}
          isSelected={selectedFileIds.includes(file.id)}
          isActivePreview={selectedFile?.id === file.id}
          canManage={canManage}
          onToggleSelect={() => toggleFileSelection(file.id)}
          onSelectFile={() => selectFile(file)}
          onRename={() => setRenameTarget(file)}
          onPermissions={() => setPermissionTarget(file)}
          onDelete={() => setDeleteTarget(file)}
          addToast={addToast}
        />
      ))}
    </div>
  );
};

interface FileCardProps {
  file: VDRFile;
  userRole: UserRole;
  isSelected: boolean;
  isActivePreview: boolean;
  canManage: boolean;
  onToggleSelect: () => void;
  onSelectFile: () => void;
  onRename: () => void;
  onPermissions: () => void;
  onDelete: () => void;
  addToast: any;
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  userRole,
  isSelected,
  isActivePreview,
  canManage,
  onToggleSelect,
  onSelectFile,
  onRename,
  onPermissions,
  onDelete,
  addToast,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const perm = file.permissions?.[userRole] || { canView: true, canEdit: canManage, canShare: true };
  const canEditFile = canManage && perm.canEdit !== false;
  const canShareFile = perm.canShare !== false;

  const getFileIcon = () => {
    if (file.isFolder) {
      return <Folder className="w-6 h-6 text-amber-500" />;
    }
    const ext = file.fileExtension?.toLowerCase() || "";
    if (ext === ".pdf") return <FileText className="w-6 h-6 text-rose-500" />;
    if (ext === ".json") return <FileCode className="w-6 h-6 text-emerald-500" />;
    if (ext === ".csv" || ext === ".xlsx") return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
    if ([".png", ".jpg", ".jpeg", ".svg"].includes(ext)) return <FileImage className="w-6 h-6 text-purple-500" />;
    return <FileText className="w-6 h-6 text-blue-500" />;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    try {
      const res = await vdrApi.getDownloadUrl(file.id);
      window.open(res.downloadUrl, "_blank");
      addToast({
        type: "success",
        title: "Download Started",
        message: `Generated secure stream for ${file.name}`,
      });
    } catch {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      window.open(`${apiUrl}/files/${file.id}/content`, "_blank");
    }
  };

  const flagCount = file.complianceFlags?.length || 0;

  return (
    <div
      onClick={onSelectFile}
      className={cn(
        "group relative flex flex-col justify-between p-4 rounded-2xl border bg-surface transition-all duration-200 cursor-pointer hover:shadow-lg overflow-hidden",
        isActivePreview
          ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10"
          : isSelected
          ? "border-blue-400 bg-blue-500/5"
          : "border-border hover:border-border-strong hover:bg-surface-raised/40"
      )}
    >
      {/* Top Header Row: Checkbox, Icon, Sensitivity Badge, Menu */}
      <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Selection Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={cn(
              "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
              isSelected
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-border bg-surface-raised opacity-0 group-hover:opacity-100 hover:border-blue-500"
            )}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Type Icon */}
          <div className="p-2 rounded-xl bg-surface-raised border border-border group-hover:scale-105 transition-transform">
            {getFileIcon()}
          </div>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 shrink">
          <SensitivityBadge sensitivity={file.sensitivity} className="text-[10px] px-2 py-0.5 max-w-[130px]" />

          {/* Context Actions Menu */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 top-6 w-44 rounded-xl border border-border bg-surface shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onSelectFile();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-text-primary hover:bg-surface-raised"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Inspect & Preview</span>
                  </button>

                  {!file.isFolder && (
                    <button
                      onClick={handleDownload}
                      disabled={!canShareFile}
                      title={!canShareFile ? "Sharing/Download restricted for this document" : "Download"}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-text-primary hover:bg-surface-raised disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Download</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onPermissions();
                    }}
                    disabled={!canManage}
                    title={!canManage ? `${userRole} cannot manage permissions` : "Permissions"}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-text-primary hover:bg-surface-raised disabled:opacity-40"
                  >
                    <Lock className="w-3.5 h-3.5 text-purple-500" />
                    <span>Permissions</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onRename();
                    }}
                    disabled={!canEditFile}
                    title={!canEditFile ? `${userRole} cannot rename this document` : "Rename"}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-text-primary hover:bg-surface-raised disabled:opacity-40"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Rename</span>
                  </button>

                  <div className="h-px bg-border my-1" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onDelete();
                    }}
                    disabled={!canEditFile}
                    title={!canEditFile ? `${userRole} cannot delete this document` : "Delete"}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Middle Body: Filename */}
      <div className="mb-3">
        <h4
          className="text-xs font-bold text-text-primary truncate leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          title={file.name}
        >
          {file.name}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
          <span>{file.isFolder ? "Folder" : formatBytes(file.sizeBytes)}</span>
          <span>•</span>
          <span>{formatDate(file.updatedAt)}</span>
        </div>
      </div>

      {/* Footer Row: Compliance Flags & Preview link */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div>
          {flagCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-3 h-3" />
              <span>{flagCount} Risk Flag{flagCount > 1 ? "s" : ""}</span>
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ Compliant
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectFile();
          }}
          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Open</span>
        </button>
      </div>
    </div>
  );
};
