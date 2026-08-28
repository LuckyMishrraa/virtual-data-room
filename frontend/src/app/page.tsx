"use client";

import React, { useEffect } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { Navbar } from "@/components/layout/Navbar";
import { SidebarTree } from "@/components/layout/SidebarTree";
import { Breadcrumbs } from "@/components/explorer/Breadcrumbs";
import { ExplorerToolbar } from "@/components/explorer/ExplorerToolbar";
import { FileGrid } from "@/components/explorer/FileGrid";
import { FileTable } from "@/components/explorer/FileTable";
import { BatchActionBar } from "@/components/explorer/BatchActionBar";
import { DocumentPreviewer } from "@/components/previewer/DocumentPreviewer";
import { AuditLogDrawer } from "@/components/drawer/AuditLogDrawer";
import { UploadModal } from "@/components/modals/UploadModal";
import { NewFolderModal } from "@/components/modals/NewFolderModal";
import { RenameModal } from "@/components/modals/RenameModal";
import { PermissionModal } from "@/components/modals/PermissionModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { ToastContainer } from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";

export default function VDRDashboard() {
  const {
    viewMode,
    isPreviewOpen,
    fetchInitialData,
    isLoading,
    files,
    closePreview,
  } = useVDRStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Keyboard shortcut listener (Escape closes preview)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePreview();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreview]);

  return (
    <div className="min-h-screen flex flex-col bg-page text-text-primary">
      {/* Toast Notification Stack */}
      <ToastContainer />

      {/* Top Global Navigation */}
      <Navbar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Tree */}
        <SidebarTree />

        {/* Center Explorer & Split-Screen Viewport */}
        <main className="flex-1 flex flex-col min-w-0 bg-surface/30 overflow-hidden">
          {/* Breadcrumb Path Bar */}
          <Breadcrumbs />

          {/* Search, Filter & View Mode Toolbar */}
          <ExplorerToolbar />

          {/* Main Files Display Area */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && files.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-24 text-text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <p className="text-xs font-semibold">Connecting to VDR data engine...</p>
              </div>
            ) : viewMode === "grid" ? (
              <FileGrid />
            ) : (
              <FileTable />
            )}
          </div>
        </main>

        {/* Split-Screen Document Previewer Panel (Slide/Split view) */}
        {isPreviewOpen && <DocumentPreviewer />}
      </div>

      {/* Floating Multi-Select Action Dock */}
      <BatchActionBar />

      {/* Modals & Slide-out Drawers */}
      <AuditLogDrawer />
      <UploadModal />
      <NewFolderModal />
      <RenameModal />
      <PermissionModal />
      <DeleteConfirmModal />
    </div>
  );
}
