"use client";

import React from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { VDRFile } from "@/types/vdr";
import { SensitivityBadge } from "@/components/ui/Badge";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import {
  Folder,
  FileText,
  FileCode,
  FileImage,
  ShieldAlert,
  Download,
  Edit2,
  Lock,
  Trash2,
  Eye,
  Check,
} from "lucide-react";
import { vdrApi } from "@/lib/api/vdrApi";

export const FileTable: React.FC = () => {
  const {
    files,
    selectedFile,
    selectedFileIds,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    selectFile,
    currentUser,
    setRenameTarget,
    setPermissionTarget,
    setDeleteTarget,
    addToast,
  } = useVDRStore();

  const canManage = currentUser.role === "Admin" || currentUser.role === "Compliance Officer";
  const allSelected = files.length > 0 && selectedFileIds.length === files.length;

  const handleDownload = async (file: VDRFile, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await vdrApi.getDownloadUrl(file.id);
      window.open(res.downloadUrl, "_blank");
      addToast({
        type: "success",
        title: "Download Initiated",
        message: `Secure link generated for ${file.name}`,
      });
    } catch {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      window.open(`${apiUrl}/files/${file.id}/content`, "_blank");
    }
  };

  const getFileIcon = (file: VDRFile) => {
    if (file.isFolder) return <Folder className="w-4 h-4 text-amber-500 shrink-0" />;
    const ext = file.fileExtension?.toLowerCase() || "";
    if (ext === ".pdf") return <FileText className="w-4 h-4 text-text-muted shrink-0" />;
    if (ext === ".json") return <FileCode className="w-4 h-4 text-text-muted shrink-0" />;
    if (ext === ".md" || ext === ".txt") return <FileText className="w-4 h-4 text-text-muted shrink-0" />;
    if ([".png", ".jpg", ".jpeg"].includes(ext)) return <FileImage className="w-4 h-4 text-text-muted shrink-0" />;
    return <FileText className="w-4 h-4 text-text-muted shrink-0" />;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-surface-raised/40 text-text-muted font-bold tracking-wider uppercase text-[10px]">
            <th className="py-3 px-4 w-10">
              <button
                onClick={allSelected ? clearSelection : selectAllFiles}
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  allSelected ? "bg-accent border-accent text-white" : "border-border bg-surface"
                )}
              >
                {allSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            </th>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Sensitivity</th>
            <th className="py-3 px-4">Compliance Status</th>
            <th className="py-3 px-4">Size</th>
            <th className="py-3 px-4">Modified</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {files
            .filter((file) => file.permissions?.[currentUser.role]?.canView !== false)
            .map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              const isActive = selectedFile?.id === file.id;
              const perm = file.permissions?.[currentUser.role] || { canView: true, canEdit: canManage, canShare: true };
              const canEditFile = canManage && perm.canEdit !== false;
              const canShareFile = perm.canShare !== false;

              return (
                <tr
                  key={file.id}
                  onClick={() => selectFile(file)}
                  className={cn(
                    "hover:bg-surface-raised/60 transition-colors cursor-pointer group",
                    isSelected && "bg-accent/10 dark:bg-accent/15"
                  )}
                >
                  {/* Checkbox — the active (currently previewing) row is marked with a
                      left accent bar instead of a ring, kept distinct from the lighter
                      background tint that marks a batch-selected row. */}
                  <td
                    className={cn(
                      "py-3 px-4 border-l-4",
                      isActive ? "border-l-accent" : "border-l-transparent"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleFileSelection(file.id)}
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-accent border-accent text-white"
                          : "border-border bg-surface hover:border-accent"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getFileIcon(file)}
                      <span className="font-semibold text-text-primary truncate max-w-xs md:max-w-md group-hover:text-accent dark:group-hover:text-accent-light">
                        {file.name}
                      </span>
                    </div>
                  </td>

                  {/* Sensitivity Badge */}
                  <td className="py-3 px-4">
                    <SensitivityBadge sensitivity={file.sensitivity} />
                  </td>

                  {/* Compliance Status */}
                  <td className="py-3 px-4">
                    {file.complianceFlags && file.complianceFlags.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sev-3-bg text-sev-1 border border-sev-3-line">
                        <ShieldAlert className="w-3 h-3" />
                        <span>{file.complianceFlags.length} Flag(s)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-success font-semibold">
                        ✓ Compliant
                      </span>
                    )}
                  </td>

                  {/* Size */}
                  <td className="py-3 px-4 text-text-muted font-mono text-[11px]">
                    {file.isFolder ? "--" : formatBytes(file.sizeBytes)}
                  </td>

                  {/* Modified Date */}
                  <td className="py-3 px-4 text-text-muted text-[11px]">
                    {formatDate(file.updatedAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {!file.isFolder && (
                        <button
                          onClick={(e) => handleDownload(file, e)}
                          disabled={!canShareFile}
                          className="p-1 rounded-md hover:bg-surface border border-transparent hover:border-border text-text-muted hover:text-accent disabled:opacity-30"
                          title={!canShareFile ? "Sharing/Download restricted for this document" : "Download"}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setRenameTarget(file)}
                        disabled={!canEditFile}
                        className="p-1 rounded-md hover:bg-surface border border-transparent hover:border-border text-text-muted hover:text-accent disabled:opacity-30"
                        title={!canEditFile ? `${currentUser.role} cannot rename this document` : "Rename"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setPermissionTarget(file)}
                        disabled={!canManage}
                        className="p-1 rounded-md hover:bg-surface border border-transparent hover:border-border text-text-muted hover:text-violet-accent disabled:opacity-30"
                        title={!canManage ? `${currentUser.role} cannot edit permissions` : "Permissions"}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(file)}
                        disabled={!canEditFile}
                        className="p-1 rounded-md hover:bg-surface border border-transparent hover:border-border text-text-muted hover:text-sev-1 disabled:opacity-30"
                        title={!canEditFile ? `${currentUser.role} cannot delete this document` : "Delete"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
