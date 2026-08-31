import { create } from "zustand";
import {
  VDRFile,
  TreeNode,
  BreadcrumbItem,
  AuditLogEntry,
  UserPersona,
  SensitivityLevel,
  UserRole,
  RolePermissions,
  ComplianceFlag,
  ViewMode,
  SortField,
  SortOrder,
} from "@/types/vdr";
import { vdrApi } from "@/lib/api/vdrApi";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}

const DEFAULT_USERS: UserPersona[] = [
  {
    id: "usr-comp-02",
    name: "Elena Rostova",
    role: "Compliance Officer",
    email: "elena.rostova@vdr-capital.com",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    title: "Chief Compliance Officer",
  },
  {
    id: "usr-admin-01",
    name: "Alexander Vance",
    role: "Admin",
    email: "alexander.vance@vdr-capital.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Managing General Partner",
  },
  {
    id: "usr-adv-03",
    name: "Marcus Sterling",
    role: "Advisor",
    email: "marcus.sterling@sterling-wealth.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Senior Portfolio Advisor",
  },
  {
    id: "usr-aud-04",
    name: "Sarah Chen, CPA",
    role: "Auditor",
    email: "sarah.chen@deloitte-audit.com",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    title: "Independent External Auditor",
  },
];

interface VDRState {
  // Explorer data
  files: VDRFile[];
  tree: TreeNode[];
  breadcrumbs: BreadcrumbItem[];
  currentFolderId: string | null;
  currentFolderName: string;
  selectedFile: VDRFile | null;
  isPreviewOpen: boolean;
  selectedFileIds: string[];
  viewMode: ViewMode;

  // Search & Filter
  searchQuery: string;
  sensitivityFilter: string;
  fileTypeFilter: string;
  sortBy: SortField;
  sortOrder: SortOrder;

  // Personas & Active User
  users: UserPersona[];
  currentUser: UserPersona;

  // Modals and Drawers
  isMobileSidebarOpen: boolean;
  isAuditDrawerOpen: boolean;
  isUploadModalOpen: boolean;
  isNewFolderModalOpen: boolean;
  renameTarget: VDRFile | null;
  permissionTarget: VDRFile | null;
  deleteTarget: VDRFile | null;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  isLoading: boolean;
  theme: "dark" | "light";
  toasts: ToastItem[];

  // Actions
  fetchInitialData: () => Promise<void>;
  navigateToFolder: (folderId: string | null) => Promise<void>;
  selectFile: (file: VDRFile) => Promise<void>;
  closePreview: () => void;
  toggleFileSelection: (fileId: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (q: string) => void;
  setSensitivityFilter: (filter: string) => void;
  setFileTypeFilter: (filter: string) => void;
  setSort: (field: SortField, order?: SortOrder) => void;
  switchUserRole: (role: UserRole) => void;

  // Modals toggle
  toggleMobileSidebar: (open?: boolean) => void;
  toggleAuditDrawer: (open?: boolean) => void;
  toggleUploadModal: (open?: boolean) => void;
  toggleNewFolderModal: (open?: boolean) => void;
  setRenameTarget: (file: VDRFile | null) => void;
  setPermissionTarget: (file: VDRFile | null) => void;
  setDeleteTarget: (file: VDRFile | null) => void;
  toggleTheme: () => void;

  // Notifications
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;

  // File CRUD Operations
  uploadFileAction: (file: File, sensitivity?: SensitivityLevel) => Promise<boolean>;
  createFolderAction: (name: string, sensitivity?: SensitivityLevel) => Promise<boolean>;
  renameFileAction: (fileId: string, newName: string) => Promise<boolean>;
  updateSensitivityAction: (fileId: string, sensitivity: SensitivityLevel) => Promise<boolean>;
  deleteFileAction: (fileId: string) => Promise<boolean>;
  batchDeleteAction: () => Promise<boolean>;
  batchTagAction: (sensitivity: SensitivityLevel) => Promise<boolean>;
  updatePermissionsAction: (fileId: string, permissions: Record<UserRole, RolePermissions>) => Promise<boolean>;
  addComplianceFlagAction: (fileId: string, lineOrSection: string, severity: "low" | "medium" | "high", reason: string) => Promise<boolean>;
  removeComplianceFlagAction: (fileId: string, flagId: string) => Promise<boolean>;
  fetchAuditLogsAction: (filters?: { fileId?: string; role?: string; action?: string }) => Promise<void>;
}

export const useVDRStore = create<VDRState>((set, get) => ({
  files: [],
  tree: [],
  breadcrumbs: [{ id: null, name: "Home", isRoot: true }],
  currentFolderId: null,
  currentFolderName: "Home",
  selectedFile: null,
  isPreviewOpen: false,
  selectedFileIds: [],
  viewMode: "grid",

  searchQuery: "",
  sensitivityFilter: "",
  fileTypeFilter: "",
  sortBy: "name",
  sortOrder: "asc",

  users: DEFAULT_USERS,
  currentUser: DEFAULT_USERS[0],

  isMobileSidebarOpen: false,
  isAuditDrawerOpen: false,
  isUploadModalOpen: false,
  isNewFolderModalOpen: false,
  renameTarget: null,
  permissionTarget: null,
  deleteTarget: null,

  auditLogs: [],
  isLoading: false,
  theme: "dark",
  toasts: [],

  addToast: (toast) => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  },

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [files, tree, breadcrumbs, users, auditLogs] = await Promise.allSettled([
        vdrApi.getFiles({ parentId: get().currentFolderId, sortBy: get().sortBy, sortOrder: get().sortOrder }),
        vdrApi.getFileTree(),
        vdrApi.getBreadcrumbs(get().currentFolderId),
        vdrApi.getUsers(),
        vdrApi.getAuditLogs({ limit: 40 }),
      ]);

      set({
        files: files.status === "fulfilled" ? files.value : [],
        tree: tree.status === "fulfilled" ? tree.value : [],
        breadcrumbs: breadcrumbs.status === "fulfilled" ? breadcrumbs.value : [{ id: null, name: "Home", isRoot: true }],
        users: users.status === "fulfilled" && users.value.length ? users.value : DEFAULT_USERS,
        auditLogs: auditLogs.status === "fulfilled" ? auditLogs.value : [],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  navigateToFolder: async (folderId) => {
    set({ currentFolderId: folderId, selectedFileIds: [], isLoading: true });
    try {
      const [files, breadcrumbs, tree] = await Promise.all([
        vdrApi.getFiles({
          parentId: folderId,
          search: get().searchQuery,
          sensitivity: get().sensitivityFilter,
          fileType: get().fileTypeFilter,
          sortBy: get().sortBy,
          sortOrder: get().sortOrder,
        }),
        vdrApi.getBreadcrumbs(folderId),
        vdrApi.getFileTree(),
      ]);

      const currentCrumb = breadcrumbs[breadcrumbs.length - 1];
      set({
        files,
        breadcrumbs,
        tree,
        currentFolderName: currentCrumb ? currentCrumb.name : "Home",
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      get().addToast({
        type: "error",
        title: "Navigation Error",
        message: "Could not load folder contents",
      });
    }
  },

  selectFile: async (file) => {
    if (file.isFolder) {
      await get().navigateToFolder(file.id);
      return;
    }
    try {
      const freshDetails = await vdrApi.getFile(file.id);
      set({ selectedFile: freshDetails, isPreviewOpen: true });
    } catch {
      set({ selectedFile: file, isPreviewOpen: true });
    }
  },

  closePreview: () => {
    set({ isPreviewOpen: false, selectedFile: null });
  },

  toggleFileSelection: (fileId) => {
    set((state) => {
      const exists = state.selectedFileIds.includes(fileId);
      return {
        selectedFileIds: exists
          ? state.selectedFileIds.filter((id) => id !== fileId)
          : [...state.selectedFileIds, fileId],
      };
    });
  },

  selectAllFiles: () => {
    const allIds = get().files.map((f) => f.id);
    set({ selectedFileIds: allIds });
  },

  clearSelection: () => {
    set({ selectedFileIds: [] });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setSearchQuery: async (q) => {
    set({ searchQuery: q });
    const { currentFolderId, sensitivityFilter, fileTypeFilter, sortBy, sortOrder } = get();
    try {
      const files = await vdrApi.getFiles({
        parentId: q ? undefined : currentFolderId,
        search: q,
        sensitivity: sensitivityFilter,
        fileType: fileTypeFilter,
        sortBy,
        sortOrder,
      });
      set({ files });
    } catch {
      // ignore
    }
  },

  setSensitivityFilter: async (filter) => {
    set({ sensitivityFilter: filter });
    const { currentFolderId, searchQuery, fileTypeFilter, sortBy, sortOrder } = get();
    try {
      const files = await vdrApi.getFiles({
        parentId: searchQuery ? undefined : currentFolderId,
        search: searchQuery,
        sensitivity: filter,
        fileType: fileTypeFilter,
        sortBy,
        sortOrder,
      });
      set({ files });
    } catch {
      // ignore
    }
  },

  setFileTypeFilter: async (filter) => {
    set({ fileTypeFilter: filter });
    const { currentFolderId, searchQuery, sensitivityFilter, sortBy, sortOrder } = get();
    try {
      const files = await vdrApi.getFiles({
        parentId: searchQuery ? undefined : currentFolderId,
        search: searchQuery,
        sensitivity: sensitivityFilter,
        fileType: filter,
        sortBy,
        sortOrder,
      });
      set({ files });
    } catch {
      // ignore
    }
  },

  setSort: async (field, order) => {
    const nextOrder = order || (get().sortBy === field && get().sortOrder === "asc" ? "desc" : "asc");
    set({ sortBy: field, sortOrder: nextOrder });
    const { currentFolderId, searchQuery, sensitivityFilter, fileTypeFilter } = get();
    try {
      const files = await vdrApi.getFiles({
        parentId: searchQuery ? undefined : currentFolderId,
        search: searchQuery,
        sensitivity: sensitivityFilter,
        fileType: fileTypeFilter,
        sortBy: field,
        sortOrder: nextOrder,
      });
      set({ files });
    } catch {
      // ignore
    }
  },

  switchUserRole: (role) => {
    const user = get().users.find((u) => u.role === role) || {
      id: "usr-" + role.toLowerCase(),
      name: role + " User",
      role: role,
      email: `${role.toLowerCase()}@vdr-capital.com`,
    };
    set({ currentUser: user });
    get().addToast({
      type: "info",
      title: "Role Switched",
      message: `Now operating with ${role} permissions.`,
    });
    get().fetchInitialData();
  },

  toggleMobileSidebar: (open) => set({ isMobileSidebarOpen: open !== undefined ? open : !get().isMobileSidebarOpen }),
  toggleAuditDrawer: (open) => {
    const next = open !== undefined ? open : !get().isAuditDrawerOpen;
    set({ isAuditDrawerOpen: next });
    if (next) get().fetchAuditLogsAction();
  },

  toggleUploadModal: (open) => set({ isUploadModalOpen: open !== undefined ? open : !get().isUploadModalOpen }),
  toggleNewFolderModal: (open) => set({ isNewFolderModalOpen: open !== undefined ? open : !get().isNewFolderModalOpen }),
  setRenameTarget: (file) => set({ renameTarget: file }),
  setPermissionTarget: (file) => set({ permissionTarget: file }),
  setDeleteTarget: (file) => set({ deleteTarget: file }),

  uploadFileAction: async (file, sensitivity = "Internal Only") => {
    const { currentFolderId, currentUser } = get();
    try {
      const newFile = await vdrApi.uploadFile(
        file,
        currentFolderId,
        sensitivity,
        currentUser.name,
        currentUser.role
      );

      set((state) => ({
        files: [newFile, ...state.files],
        isUploadModalOpen: false,
      }));
      get().addToast({
        type: "success",
        title: "File Ingested",
        message: `${file.name} saved to MinIO and indexed.`,
      });
      get().fetchInitialData();
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Upload Failed",
        message: err.message || "Failed to upload file",
      });
      return false;
    }
  },

  createFolderAction: async (name, sensitivity = "Internal Only") => {
    const { currentFolderId } = get();
    try {
      const folder = await vdrApi.createFolder({
        name,
        parentId: currentFolderId,
        sensitivity,
      });
      set((state) => ({
        files: [folder, ...state.files],
        isNewFolderModalOpen: false,
      }));
      get().addToast({
        type: "success",
        title: "Folder Created",
        message: `Created directory "${name}"`,
      });
      get().fetchInitialData();
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Folder Creation Failed",
        message: err.message || "Could not create folder",
      });
      return false;
    }
  },

  renameFileAction: async (fileId, newName) => {
    const { currentUser } = get();
    try {
      const updated = await vdrApi.updateFile(fileId, { name: newName }, currentUser.name, currentUser.role);
      set((state) => ({
        files: state.files.map((f) => (f.id === fileId ? updated : f)),
        selectedFile: state.selectedFile?.id === fileId ? updated : state.selectedFile,
        renameTarget: null,
      }));
      get().addToast({
        type: "success",
        title: "Item Renamed",
        message: `Renamed to "${newName}"`,
      });
      get().fetchInitialData();
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Rename Failed",
        message: err.message || "Could not rename item",
      });
      return false;
    }
  },

  updateSensitivityAction: async (fileId, sensitivity) => {
    const { currentUser } = get();
    try {
      const updated = await vdrApi.updateFile(fileId, { sensitivity }, currentUser.name, currentUser.role);
      set((state) => ({
        files: state.files.map((f) => (f.id === fileId ? updated : f)),
        selectedFile: state.selectedFile?.id === fileId ? updated : state.selectedFile,
      }));
      get().addToast({
        type: "success",
        title: "Sensitivity Updated",
        message: `Security tag set to "${sensitivity}"`,
      });
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Tag Update Failed",
        message: err.message || "Could not update tag",
      });
      return false;
    }
  },

  deleteFileAction: async (fileId) => {
    const { currentUser } = get();
    const target = get().files.find((f) => f.id === fileId);
    try {
      if (target?.isFolder) {
        await vdrApi.deleteFolder(fileId);
      } else {
        await vdrApi.deleteFile(fileId, currentUser.name, currentUser.role);
      }

      set((state) => ({
        files: state.files.filter((f) => f.id !== fileId),
        selectedFile: state.selectedFile?.id === fileId ? null : state.selectedFile,
        isPreviewOpen: state.selectedFile?.id === fileId ? false : state.isPreviewOpen,
        selectedFileIds: state.selectedFileIds.filter((id) => id !== fileId),
        deleteTarget: null,
      }));
      get().addToast({
        type: "success",
        title: "Item Deleted",
        message: `Deleted "${target?.name || "item"}"`,
      });
      get().fetchInitialData();
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Deletion Failed",
        message: err.message || "Could not delete item",
      });
      return false;
    }
  },

  batchDeleteAction: async () => {
    const { selectedFileIds } = get();
    if (!selectedFileIds.length) return false;
    try {
      await vdrApi.batchDelete(selectedFileIds);
      set((state) => ({
        files: state.files.filter((f) => !selectedFileIds.includes(f.id)),
        selectedFileIds: [],
      }));
      get().addToast({
        type: "success",
        title: "Batch Deletion Complete",
        message: `Removed ${selectedFileIds.length} item(s)`,
      });
      get().fetchInitialData();
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Batch Action Failed",
        message: err.message || "Batch delete failed",
      });
      return false;
    }
  },

  batchTagAction: async (sensitivity) => {
    const { selectedFileIds, currentUser } = get();
    if (!selectedFileIds.length) return false;
    try {
      await vdrApi.batchTag(selectedFileIds, sensitivity, currentUser.name, currentUser.role);
      set((state) => ({
        files: state.files.map((f) => (selectedFileIds.includes(f.id) ? { ...f, sensitivity } : f)),
        selectedFileIds: [],
      }));
      get().addToast({
        type: "success",
        title: "Batch Tagged",
        message: `Tagged ${selectedFileIds.length} items as "${sensitivity}"`,
      });
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Batch Tag Failed",
        message: err.message || "Batch tag failed",
      });
      return false;
    }
  },

  updatePermissionsAction: async (fileId, permissions) => {
    const { currentUser } = get();
    try {
      const updated = await vdrApi.updatePermissions(fileId, permissions, currentUser.name, currentUser.role);
      set((state) => ({
        files: state.files.map((f) => (f.id === fileId ? updated : f)),
        selectedFile: state.selectedFile?.id === fileId ? updated : state.selectedFile,
        permissionTarget: null,
      }));
      get().addToast({
        type: "success",
        title: "Permissions Updated",
        message: "RBAC access rules applied.",
      });
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Permission Update Failed",
        message: err.message || "Could not update permissions",
      });
      return false;
    }
  },

  addComplianceFlagAction: async (fileId, lineOrSection, severity, reason) => {
    const { currentUser } = get();
    try {
      const flag = await vdrApi.addComplianceFlag(fileId, { lineOrSection, severity, reason }, currentUser.name, currentUser.role);
      set((state) => {
        const updateFlags = (f: VDRFile) => (f.id === fileId ? { ...f, complianceFlags: [...f.complianceFlags, flag] } : f);
        return {
          files: state.files.map(updateFlags),
          selectedFile: state.selectedFile?.id === fileId ? { ...state.selectedFile, complianceFlags: [...state.selectedFile.complianceFlags, flag] } : state.selectedFile,
        };
      });
      get().addToast({
        type: "warning",
        title: "Compliance Flag Added",
        message: `Logged ${severity.toUpperCase()} flag: ${reason}`,
      });
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Flagging Failed",
        message: err.message || "Could not add flag",
      });
      return false;
    }
  },

  removeComplianceFlagAction: async (fileId, flagId) => {
    const { currentUser } = get();
    try {
      await vdrApi.removeComplianceFlag(fileId, flagId, currentUser.name, currentUser.role);
      set((state) => {
        const removeFlag = (f: VDRFile) =>
          f.id === fileId ? { ...f, complianceFlags: f.complianceFlags.filter((cf) => cf.id !== flagId) } : f;
        return {
          files: state.files.map(removeFlag),
          selectedFile: state.selectedFile?.id === fileId ? { ...state.selectedFile, complianceFlags: state.selectedFile.complianceFlags.filter((cf) => cf.id !== flagId) } : state.selectedFile,
        };
      });
      get().addToast({
        type: "success",
        title: "Flag Resolved",
        message: "Compliance marker cleared.",
      });
      return true;
    } catch (err: any) {
      get().addToast({
        type: "error",
        title: "Resolution Failed",
        message: err.message || "Could not remove flag",
      });
      return false;
    }
  },

  fetchAuditLogsAction: async (filters) => {
    try {
      const auditLogs = await vdrApi.getAuditLogs(filters);
      set({ auditLogs });
    } catch {
      // ignore
    }
  },
}));
