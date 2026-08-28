"use client";

import React, { useState, useEffect } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { ComplianceFlag, UserRole } from "@/types/vdr";
import { SensitivityBadge, SeverityBadge } from "@/components/ui/Badge";
import { TextViewer } from "@/components/previewer/TextViewer";
import { JsonViewer } from "@/components/previewer/JsonViewer";
import { ImageViewer } from "@/components/previewer/ImageViewer";
import { PdfViewer } from "@/components/previewer/PdfViewer";
import { ComplianceFlagInspector } from "@/components/previewer/ComplianceFlagInspector";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import {
  X,
  Download,
  ShieldAlert,
  Lock,
  FileText,
  Plus,
  CheckCircle2,
  Image as ImageIcon,
  FileCode,
} from "lucide-react";
import { vdrApi } from "@/lib/api/vdrApi";

type PreviewTab = "content" | "flags" | "permissions" | "history";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const DocumentPreviewer: React.FC = () => {
  const {
    selectedFile,
    closePreview,
    currentUser,
    setPermissionTarget,
    addComplianceFlagAction,
    removeComplianceFlagAction,
    addToast,
  } = useVDRStore();

  const [activeTab, setActiveTab] = useState<PreviewTab>("content");
  const [inspectedFlag, setInspectedFlag] = useState<ComplianceFlag | null>(null);
  const [isAddFlagOpen, setIsAddFlagOpen] = useState(false);
  const [newFlagSection, setNewFlagSection] = useState("");
  const [newFlagSeverity, setNewFlagSeverity] = useState<"low" | "medium" | "high">("high");
  const [newFlagReason, setNewFlagReason] = useState("");
  const [fetchedTextContent, setFetchedTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  const isAuditor = currentUser.role === "Auditor";
  const ext = selectedFile?.fileExtension?.toLowerCase() || "";
  const flags = selectedFile?.complianceFlags || [];

  useEffect(() => {
    if (!selectedFile) return;
    const isTextLike = [".txt", ".md", ".json", ".csv", ".log", ""].includes(ext);
    if (isTextLike && !IMAGE_EXTENSIONS.includes(ext) && ext !== ".pdf") {
      setIsLoadingText(true);
      fetch(`${API_BASE_URL}/files/${selectedFile.id}/content`)
        .then((res) => (res.ok ? res.text() : Promise.reject()))
        .then((txt) => {
          setFetchedTextContent(txt);
          setIsLoadingText(false);
        })
        .catch(() => {
          setFetchedTextContent(selectedFile.contentPreview || "No preview available.");
          setIsLoadingText(false);
        });
    }
  }, [selectedFile?.id, ext]);

  if (!selectedFile) return null;

  const handleDownload = async () => {
    try {
      const res = await vdrApi.getDownloadUrl(selectedFile.id);
      window.open(res.downloadUrl, "_blank");
      addToast({
        type: "success",
        title: "Download Started",
        message: `Generated secure stream for ${selectedFile.name}`,
      });
    } catch {
      window.open(`${API_BASE_URL}/files/${selectedFile.id}/content`, "_blank");
    }
  };

  const handleAddFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagSection || !newFlagReason) return;

    await addComplianceFlagAction(selectedFile.id, newFlagSection, newFlagSeverity, newFlagReason);
    setNewFlagSection("");
    setNewFlagReason("");
    setIsAddFlagOpen(false);
  };

  const getHeaderIcon = () => {
    if (IMAGE_EXTENSIONS.includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    if (ext === ".pdf") {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    if (ext === ".json") {
      return <FileCode className="w-5 h-5 text-emerald-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="w-full lg:w-[520px] xl:w-[620px] h-[calc(100vh-4rem)] border-l border-border bg-surface flex flex-col shrink-0 shadow-2xl z-20 transition-all duration-300">
      {/* Top Header */}
      <div className="p-4 border-b border-border bg-surface-raised/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-surface border border-border shrink-0 shadow-xs">
            {getHeaderIcon()}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-text-primary truncate" title={selectedFile.name}>
              {selectedFile.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <SensitivityBadge sensitivity={selectedFile.sensitivity} />
              <span className="text-[11px] text-text-muted">{formatBytes(selectedFile.sizeBytes)}</span>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-secondary hover:text-text-primary"
            title="Download Document"
          >
            <Download className="w-4 h-4 text-emerald-500" />
          </button>
          <button
            onClick={closePreview}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-muted hover:text-text-primary"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center border-b border-border bg-surface text-xs font-semibold px-2">
        <button
          onClick={() => setActiveTab("content")}
          className={cn(
            "px-3 py-2.5 border-b-2 transition-all",
            activeTab === "content"
              ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Preview
        </button>

        <button
          onClick={() => setActiveTab("flags")}
          className={cn(
            "px-3 py-2.5 border-b-2 transition-all flex items-center gap-1.5",
            activeTab === "flags"
              ? "border-rose-500 text-rose-600 dark:text-rose-400 font-bold"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          <span>Compliance</span>
          {flags.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[10px] font-bold">
              {flags.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={cn(
            "px-3 py-2.5 border-b-2 transition-all",
            activeTab === "permissions"
              ? "border-purple-500 text-purple-600 dark:text-purple-400 font-bold"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Access & RBAC
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "px-3 py-2.5 border-b-2 transition-all",
            activeTab === "history"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          History
        </button>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: Real Content Preview */}
        {activeTab === "content" && (
          <div className="space-y-4">
            {IMAGE_EXTENSIONS.includes(ext) ? (
              <ImageViewer
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                sizeBytes={selectedFile.sizeBytes}
              />
            ) : ext === ".pdf" ? (
              <PdfViewer
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                sizeBytes={selectedFile.sizeBytes}
              />
            ) : ext === ".json" ? (
              <JsonViewer content={fetchedTextContent || selectedFile.contentPreview || "{}"} />
            ) : (
              <TextViewer
                content={
                  fetchedTextContent ||
                  selectedFile.contentPreview ||
                  "No raw text preview available. You can download the binary directly."
                }
                complianceFlags={flags}
                onSelectFlag={(f) => setInspectedFlag(f)}
              />
            )}
          </div>
        )}

        {/* TAB 2: Compliance Flags */}
        {activeTab === "flags" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-text-primary">Regulatory Violation Markers</h4>
                <p className="text-[11px] text-text-muted">
                  Flags tracked per SEC guidelines and institutional covenants.
                </p>
              </div>

              <button
                onClick={() => setIsAddFlagOpen(!isAddFlagOpen)}
                disabled={isAuditor}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Flag</span>
              </button>
            </div>

            {/* Add Flag Form */}
            {isAddFlagOpen && (
              <form
                onSubmit={handleAddFlagSubmit}
                className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2.5 animate-in fade-in"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Section or Line Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={newFlagSection}
                    onChange={(e) => setNewFlagSection(e.target.value)}
                    placeholder="e.g. Clause 4.2 - Material Exposure"
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface text-text-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Severity Level
                  </label>
                  <select
                    value={newFlagSeverity}
                    onChange={(e) => setNewFlagSeverity(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-lg border border-border bg-surface text-text-primary text-xs"
                  >
                    <option value="high">High Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="low">Low Severity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Violation Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newFlagReason}
                    onChange={(e) => setNewFlagReason(e.target.value)}
                    placeholder="Explain compliance or confidentiality risk..."
                    className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFlagOpen(false)}
                    className="px-3 py-1 text-xs rounded-lg border border-border hover:bg-surface-raised"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Save Flag
                  </button>
                </div>
              </form>
            )}

            {/* List of Flags */}
            {flags.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-text-primary">No Active Flags</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Document has satisfied automated compliance validation.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-3 rounded-xl border border-border bg-surface-raised/40 space-y-2 hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary">{flag.lineOrSection}</span>
                      <SeverityBadge severity={flag.severity} />
                    </div>
                    <p className="text-text-secondary text-xs">{flag.reason}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-text-muted">
                      <span>{formatDate(flag.timestamp)}</span>
                      {!isAuditor && (
                        <button
                          onClick={() => removeComplianceFlagAction(selectedFile.id, flag.id)}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                        >
                          Resolve Flag
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Permissions Matrix */}
        {activeTab === "permissions" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-text-primary">Role-Based Access Rights</h4>
                <p className="text-[11px] text-text-muted">
                  Configured permissions for this document.
                </p>
              </div>

              <button
                onClick={() => setPermissionTarget(selectedFile)}
                disabled={isAuditor}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-40"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Edit Matrix</span>
              </button>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-raised text-text-muted uppercase text-[10px] border-b border-border">
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-center">View</th>
                    <th className="py-2.5 px-3 text-center">Edit</th>
                    <th className="py-2.5 px-3 text-center">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(["Admin", "Compliance Officer", "Advisor", "Auditor"] as UserRole[]).map((role) => {
                    const perm = selectedFile.permissions?.[role] || { canView: true, canEdit: false, canShare: false };
                    return (
                      <tr key={role} className="hover:bg-surface-raised/40">
                        <td className="py-2.5 px-3 font-semibold text-text-primary">{role}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {perm.canView ? <span className="text-emerald-500">✓</span> : <span className="text-rose-500">✕</span>}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {perm.canEdit ? <span className="text-emerald-500">✓</span> : <span className="text-rose-500">✕</span>}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {perm.canShare ? <span className="text-emerald-500">✓</span> : <span className="text-rose-500">✕</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Metadata & Storage */}
        {activeTab === "history" && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-text-primary mb-2">Storage Metadata</h4>
            <div className="p-3.5 rounded-xl border border-border bg-surface-raised/40 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">File ID:</span>
                <span className="font-mono text-text-primary">{selectedFile.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Storage Bucket:</span>
                <span className="font-mono text-blue-500 font-bold">minio://vdr-documents</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Object Key:</span>
                <span className="font-mono text-text-primary truncate max-w-[220px]">
                  {selectedFile.storageKey || "direct-minio-stream"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">MIME Type:</span>
                <span className="text-text-primary">{selectedFile.mimeType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Last Modified:</span>
                <span className="text-text-primary">{formatDate(selectedFile.updatedAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flag Inspector Modal Trigger */}
      {inspectedFlag && (
        <ComplianceFlagInspector
          flag={inspectedFlag}
          fileId={selectedFile.id}
          onClose={() => setInspectedFlag(null)}
          onResolve={(flagId) => removeComplianceFlagAction(selectedFile.id, flagId)}
          canResolve={!isAuditor}
        />
      )}
    </div>
  );
};
