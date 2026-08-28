export type SensitivityLevel = 'Confidential' | 'Restricted' | 'Internal Only' | 'Public';

export type UserRole = 'Admin' | 'Compliance Officer' | 'Advisor' | 'Auditor';

export type ActionType =
  | 'Uploaded'
  | 'Viewed'
  | 'Downloaded'
  | 'Flagged'
  | 'Renamed'
  | 'Permission Changed'
  | 'Deleted';

export interface RolePermissions {
  canView: boolean;
  canEdit: boolean;
  canShare: boolean;
}

export interface ComplianceFlag {
  id: string;
  lineOrSection: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  timestamp: string;
}

export interface VDRFile {
  id: string;
  name: string;
  parentId: string | null;
  isFolder: boolean;
  sizeBytes: number;
  mimeType: string;
  fileExtension: string;
  sensitivity: SensitivityLevel;
  complianceFlags: ComplianceFlag[];
  permissions: Record<UserRole, RolePermissions>;
  createdAt: string;
  updatedAt: string;
  storageKey?: string | null;
  contentPreview?: string | null;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
  isRoot: boolean;
}

export interface TreeNode {
  id: string;
  name: string;
  isFolder: boolean;
  sensitivity: SensitivityLevel;
  parentId: string | null;
  children: TreeNode[];
}

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  title?: string;
}

export interface AuditLogActor {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  fileId: string;
  fileName: string;
  action: ActionType;
  actor: AuditLogActor;
  details: string;
  timestamp: string;
}

export type ViewMode = 'grid' | 'table';
export type SortField = 'name' | 'date' | 'size' | 'sensitivity';
export type SortOrder = 'asc' | 'desc';
