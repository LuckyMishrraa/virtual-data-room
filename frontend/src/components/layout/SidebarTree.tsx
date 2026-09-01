"use client";

import React, { useState } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { TreeNode } from "@/types/vdr";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Layers,
  ShieldAlert,
  HardDrive,
  CheckCircle2,
  FileText,
  Lock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SidebarTree: React.FC = () => {
  const {
    tree,
    currentFolderId,
    navigateToFolder,
    setSensitivityFilter,
    sensitivityFilter,
    isMobileSidebarOpen,
    toggleMobileSidebar,
  } = useVDRStore();

  const renderSidebarContent = (isMobile = false) => (
    <>
      {isMobile && (
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-accent" />
            <span className="font-bold text-xs text-text-primary">Folder Navigation</span>
          </div>
          <button
            onClick={() => toggleMobileSidebar(false)}
            className="p-1 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text-primary"
            title="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Access Section */}
      <div className="p-3 border-b border-border space-y-1">
        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Quick Filters
        </p>

        <button
          onClick={() => {
            setSensitivityFilter("");
            navigateToFolder(null);
            if (isMobile) toggleMobileSidebar(false);
          }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
            currentFolderId === null && sensitivityFilter === ""
              ? "bg-accent/10 text-accent dark:text-accent-light font-bold"
              : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>All Disclosures & Funds</span>
        </button>

        <button
          onClick={() => {
            setSensitivityFilter("Confidential");
            if (isMobile) toggleMobileSidebar(false);
          }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
            sensitivityFilter === "Confidential"
              ? "bg-sev-1/10 text-sev-1 font-bold"
              : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
          )}
        >
          <Lock className="w-4 h-4 text-sev-1" />
          <span>Confidential Only</span>
        </button>

        <button
          onClick={() => {
            setSensitivityFilter("Restricted");
            if (isMobile) toggleMobileSidebar(false);
          }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
            sensitivityFilter === "Restricted"
              ? "bg-sev-2/10 text-sev-2 font-bold"
              : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
          )}
        >
          <ShieldAlert className="w-4 h-4 text-sev-2" />
          <span>Restricted Assets</span>
        </button>
      </div>

      {/* Directory Hierarchy Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Directory Hierarchy
        </p>

        {tree.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-text-muted">
            No folders created yet
          </div>
        ) : (
          <div className="space-y-0.5">
            {tree.map((node) => (
              <TreeItem key={node.id} node={node} level={0} isMobile={isMobile} />
            ))}
          </div>
        )}
      </div>

      {/* Storage & MinIO Engine Status Widget */}
      <div className="p-3 border-t border-border bg-surface-raised/40">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="flex items-center gap-1.5 font-semibold text-text-secondary">
            <HardDrive className="w-3.5 h-3.5 text-accent" />
            MinIO S3 Storage
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-success">
            <CheckCircle2 className="w-3 h-3" />
            Online
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden mb-1">
          <div className="bg-gradient-to-r from-accent to-accent-dark h-full w-[28%] rounded-full" />
        </div>
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>1.4 GB used</span>
          <span>5.0 GB Quota</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="w-64 shrink-0 border-r border-border bg-surface flex-col h-[calc(100vh-4rem)] select-none hidden lg:flex">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => toggleMobileSidebar(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-surface border-r border-border flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200 select-none">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

const TreeItem: React.FC<{ node: TreeNode; level: number; isMobile?: boolean }> = ({ node, level, isMobile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { currentFolderId, navigateToFolder, toggleMobileSidebar } = useVDRStore();

  const isFolder = node.isFolder;
  const isSelected = currentFolderId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        onClick={() => {
          if (isFolder) {
            navigateToFolder(node.id);
            if (isMobile) toggleMobileSidebar(false);
          }
        }}
        className={cn(
          "group flex items-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium cursor-pointer transition-all",
          isSelected
            ? "bg-accent text-white font-semibold shadow-xs"
            : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
        )}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
      >
        {isFolder ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5 rounded hover:bg-white/20 transition-colors"
          >
            {hasChildren ? (
              isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              )
            ) : (
              <span className="w-3.5 h-3.5 inline-block" />
            )}
          </button>
        ) : (
          <span className="w-3.5 h-3.5 inline-block" />
        )}

        {isFolder ? (
          isOpen ? (
            <FolderOpen className={cn("w-4 h-4 shrink-0", isSelected ? "text-white" : "text-amber-500")} />
          ) : (
            <Folder className={cn("w-4 h-4 shrink-0", isSelected ? "text-white" : "text-amber-500")} />
          )
        ) : (
          <FileText className={cn("w-4 h-4 shrink-0", isSelected ? "text-white" : "text-slate-400")} />
        )}

        <span className="truncate flex-1">{node.name}</span>
      </div>

      {isFolder && isOpen && hasChildren && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
