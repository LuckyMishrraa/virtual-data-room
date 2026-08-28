"use client";

import React, { useState } from "react";
import { useVDRStore } from "@/store/useVDRStore";
import { UserRole } from "@/types/vdr";
import {
  ShieldCheck,
  Upload,
  FolderPlus,
  History,
  Moon,
  Sun,
  Search,
  ChevronDown,
  UserCheck,
  Lock,
} from "lucide-react";
import { getRoleBadge } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUserRole,
    searchQuery,
    setSearchQuery,
    theme,
    toggleTheme,
    toggleAuditDrawer,
    toggleUploadModal,
    toggleNewFolderModal,
    auditLogs,
  } = useVDRStore();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // RBAC permissions check for action gating
  const isAuditor = currentUser.role === "Auditor";
  const roleBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Brand & Security Stamp */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/20 text-white font-black text-lg tracking-wider">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-text-primary">
                ACUMEN <span className="text-blue-600 dark:text-blue-400">VDR</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                AES-256
              </span>
            </div>
            <p className="text-[11px] text-text-muted hidden md:block">
              Virtual Data Room & Compliance Platform
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, folders, SEC filings, tags..."
              className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-surface-raised border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>
        </div>

        {/* Right Section: Actions, Role Switcher, Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Folder Button */}
          <button
            onClick={() => toggleNewFolderModal(true)}
            disabled={isAuditor}
            title={isAuditor ? "Auditors have read-only access (Folder creation restricted)" : "Create New Folder"}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            {isAuditor ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <FolderPlus className="w-3.5 h-3.5 text-blue-500" />}
            <span>New Folder</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => toggleUploadModal(true)}
            disabled={isAuditor}
            title={isAuditor ? "Auditors have read-only access (Upload restricted)" : "Upload Documents"}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isAuditor ? <Lock className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">Upload</span>
          </button>

          {/* Audit Trail Drawer Toggle Button */}
          <button
            onClick={() => toggleAuditDrawer()}
            className="relative inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-primary transition-all shadow-xs"
          >
            <History className="w-4 h-4 text-purple-500" />
            <span className="hidden lg:inline">Audit Trail</span>
            {auditLogs.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 px-1 text-[11px] font-bold border border-purple-500/20">
                {auditLogs.length}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-primary transition-all shadow-xs"
            title="Toggle Light / Dark Mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Role Switcher & Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 h-10 px-2.5 rounded-xl border border-border bg-surface-raised hover:border-blue-500/40 text-left transition-all"
            >
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/30"
              />
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-text-primary leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-text-muted leading-none">
                  {currentUser.role}
                </div>
              </div>
              <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleBadge.badgeClass}`}>
                {roleBadge.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-surface shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      Switch Role (RBAC Simulation)
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Select a role to verify real-time permissions & UI action gating.
                    </p>
                  </div>

                  <div className="space-y-1">
                    {users.map((user) => {
                      const isSelected = currentUser.role === user.role;
                      const badge = getRoleBadge(user.role);
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUserRole(user.role);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                            isSelected
                              ? "bg-blue-500/10 border border-blue-500/30"
                              : "hover:bg-surface-raised"
                          }`}
                        >
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-text-primary truncate">
                                {user.name}
                              </span>
                              {isSelected && <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-bold px-1 rounded border ${badge.badgeClass}`}>
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
