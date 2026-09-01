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
  Menu,
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
    toggleMobileSidebar,
    auditLogs,
  } = useVDRStore();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // RBAC permissions check for action gating
  const canManage = currentUser.role === "Admin" || currentUser.role === "Compliance Officer";
  const roleBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/70 backdrop-blur-md backdrop-saturate-150 transition-colors">
      <div className="navbar-glow" aria-hidden="true" />
      <div className="relative flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Brand & Security Stamp */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={() => toggleMobileSidebar()}
            className="lg:hidden p-2 rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-primary transition-colors"
            title="Toggle Folder Navigation"
            aria-label="Toggle Folder Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-tl-[14px] rounded-tr-[14px] rounded-bl-[14px] rounded-br-[4px] bg-gradient-to-br from-accent to-accent-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(33,64,189,0.35),0_8px_18px_-6px_rgba(33,64,189,0.6)] text-white font-black text-lg tracking-wider">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tighter text-text-primary">
                ACUMEN <span className="text-accent dark:text-accent-light">VDR</span>
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
              className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-surface-raised border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
            />
          </div>
        </div>

        {/* Right Section: Actions, Role Switcher, Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Folder Button */}
          <button
            onClick={() => toggleNewFolderModal(true)}
            disabled={!canManage}
            title={!canManage ? `${currentUser.role}s have read-only access (Folder creation restricted)` : "Create New Folder"}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            {!canManage ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <FolderPlus className="w-3.5 h-3.5 text-accent" />}
            <span>New Folder</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => toggleUploadModal(true)}
            disabled={!canManage}
            title={!canManage ? `${currentUser.role}s have read-only access (Upload restricted)` : "Upload Documents"}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold tracking-tight rounded-xl bg-gradient-to-br from-accent to-accent-dark text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(33,64,189,0.3),0_10px_22px_-8px_rgba(33,64,189,0.7)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {!canManage ? <Lock className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">Upload</span>
          </button>

          {/* Audit Trail Drawer Toggle Button */}
          <button
            onClick={() => toggleAuditDrawer()}
            className="relative inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-primary transition-all shadow-xs"
          >
            <History className="w-4 h-4 text-text-muted" />
            <span className="hidden lg:inline">Audit Trail</span>
            {auditLogs.length > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sev-3-bg text-sev-1 px-1 text-[11px] font-bold border border-sev-3-line">
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
              className="flex items-center gap-2 h-10 px-2.5 rounded-xl border border-border bg-surface-raised hover:border-accent/40 text-left transition-all"
            >
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-accent/30"
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
                  className="fixed inset-0 z-[60]"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-surface shadow-2xl p-2 z-[70] animate-in fade-in zoom-in-95 duration-150">
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
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${isSelected
                            ? "bg-accent/10 border border-accent/30"
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
                              {isSelected && <UserCheck className="w-3.5 h-3.5 text-accent shrink-0" />}
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
