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
  SortField,
  SortOrder,
} from "@/types/vdr";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = "API Request failed";
    try {
      const err = await response.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const vdrApi = {
  // 1. Files
  async getFiles(params?: {
    parentId?: string | null;
    search?: string;
    sensitivity?: string;
    fileType?: string;
    sortBy?: SortField;
    sortOrder?: SortOrder;
  }): Promise<VDRFile[]> {
    const query = new URLSearchParams();
    if (params?.parentId !== undefined) {
      query.append("parentId", params.parentId || "root");
    }
    if (params?.search) query.append("search", params.search);
    if (params?.sensitivity) query.append("sensitivity", params.sensitivity);
    if (params?.fileType) query.append("fileType", params.fileType);
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    return request<VDRFile[]>(`/files?${query.toString()}`);
  },

  async getFileTree(): Promise<TreeNode[]> {
    return request<TreeNode[]>("/files/tree");
  },

  async getFile(fileId: string): Promise<VDRFile> {
    return request<VDRFile>(`/files/${fileId}`);
  },

  async uploadFile(
    file: File,
    parentId?: string | null,
    sensitivity: SensitivityLevel = "Internal Only",
    actorName?: string,
    actorRole?: string
  ): Promise<VDRFile> {
    const formData = new FormData();
    formData.append("file", file);
    if (parentId) formData.append("parentId", parentId);
    formData.append("sensitivity", sensitivity);
    if (actorName) formData.append("actorName", actorName);
    if (actorRole) formData.append("actorRole", actorRole);

    return request<VDRFile>("/files/upload", {
      method: "POST",
      body: formData,
    });
  },

  async getDownloadUrl(fileId: string): Promise<{ downloadUrl: string; fileName: string; sizeBytes: number }> {
    return request<{ downloadUrl: string; fileName: string; sizeBytes: number }>(`/files/${fileId}/download-url`);
  },

  async updateFile(
    fileId: string,
    updates: { name?: string; sensitivity?: SensitivityLevel },
    actorName?: string,
    actorRole?: string
  ): Promise<VDRFile> {
    const query = new URLSearchParams();
    if (actorName) query.append("actorName", actorName);
    if (actorRole) query.append("actorRole", actorRole);

    return request<VDRFile>(`/files/${fileId}?${query.toString()}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteFile(
    fileId: string,
    actorName?: string,
    actorRole?: string
  ): Promise<{ success: boolean; deletedCount: number; deletedIds: string[] }> {
    const query = new URLSearchParams();
    if (actorName) query.append("actorName", actorName);
    if (actorRole) query.append("actorRole", actorRole);

    return request<{ success: boolean; deletedCount: number; deletedIds: string[] }>(`/files/${fileId}?${query.toString()}`, {
      method: "DELETE",
    });
  },

  async batchDelete(fileIds: string[]): Promise<{ success: boolean; affectedCount: number; affectedIds: string[] }> {
    return request<{ success: boolean; affectedCount: number; affectedIds: string[] }>("/files/batch-delete", {
      method: "POST",
      body: JSON.stringify({ fileIds }),
    });
  },

  async batchTag(
    fileIds: string[],
    sensitivity: SensitivityLevel,
    actorName?: string,
    actorRole?: string
  ): Promise<{ success: boolean; affectedCount: number; affectedIds: string[] }> {
    const query = new URLSearchParams();
    if (actorName) query.append("actorName", actorName);
    if (actorRole) query.append("actorRole", actorRole);

    return request<{ success: boolean; affectedCount: number; affectedIds: string[] }>(`/files/batch-tag?${query.toString()}`, {
      method: "POST",
      body: JSON.stringify({ fileIds, sensitivity }),
    });
  },

  // 2. Folders
  async createFolder(payload: { name: string; parentId?: string | null; sensitivity?: SensitivityLevel }): Promise<VDRFile> {
    return request<VDRFile>("/folders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getBreadcrumbs(folderId?: string | null): Promise<BreadcrumbItem[]> {
    const idParam = folderId || "root";
    return request<BreadcrumbItem[]>(`/folders/breadcrumbs/${idParam}`);
  },

  async deleteFolder(folderId: string): Promise<{ success: boolean; deletedCount: number; deletedIds: string[] }> {
    return request<{ success: boolean; deletedCount: number; deletedIds: string[] }>(`/folders/${folderId}`, {
      method: "DELETE",
    });
  },

  // 3. Permissions
  async getPermissions(fileId: string): Promise<Record<UserRole, RolePermissions>> {
    return request<Record<UserRole, RolePermissions>>(`/files/${fileId}/permissions`);
  },

  async updatePermissions(
    fileId: string,
    permissions: Record<UserRole, RolePermissions>,
    actorName?: string,
    actorRole?: string
  ): Promise<VDRFile> {
    const query = new URLSearchParams();
    if (actorName) query.append("actorName", actorName);
    if (actorRole) query.append("actorRole", actorRole);

    return request<VDRFile>(`/files/${fileId}/permissions?${query.toString()}`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    });
  },

  // 4. Compliance Flags
  async addComplianceFlag(
    fileId: string,
    payload: { lineOrSection: string; severity: "low" | "medium" | "high"; reason: string },
    actorName?: string,
    actorRole?: string
  ): Promise<ComplianceFlag> {
    const query = new URLSearchParams();
    if (actorName) query.append("actorName", actorName);
    if (actorRole) query.append("actorRole", actorRole);

    return request<ComplianceFlag>(`/files/${fileId}/flags?${query.toString()}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async removeComplianceFlag(
    fileId: string,
    flagId: string,
    actorName?: string,
    actorRole?: string
  ): Promise<{ success: boolean; resolvedFlagId: string }> {
    const query = new URLSearchParams();
    if (actorName) query.append("actorName", actorName);
    if (actorRole) query.append("actorRole", actorRole);

    return request<{ success: boolean; resolvedFlagId: string }>(`/files/${fileId}/flags/${flagId}?${query.toString()}`, {
      method: "DELETE",
    });
  },

  // 5. Audit Trail
  async getAuditLogs(filters?: { fileId?: string; role?: string; action?: string; limit?: number }): Promise<AuditLogEntry[]> {
    const query = new URLSearchParams();
    if (filters?.fileId) query.append("fileId", filters.fileId);
    if (filters?.role) query.append("role", filters.role);
    if (filters?.action) query.append("action", filters.action);
    if (filters?.limit) query.append("limit", filters.limit.toString());

    return request<AuditLogEntry[]>(`/audit-logs?${query.toString()}`);
  },

  // 6. Users
  async getUsers(): Promise<UserPersona[]> {
    return request<UserPersona[]>("/users");
  },
};
