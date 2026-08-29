from typing import Literal

from pydantic import BaseModel, ConfigDict

SensitivityLevel = Literal['Confidential', 'Restricted', 'Internal Only', 'Public']
UserRole = Literal['Admin', 'Compliance Officer', 'Advisor', 'Auditor']
ActionType = Literal['Uploaded', 'Viewed', 'Downloaded', 'Flagged', 'Renamed', 'Permission Changed', 'Deleted']

class RolePermissions(BaseModel):
    canView: bool = True
    canEdit: bool = False
    canShare: bool = False

class ComplianceFlagBase(BaseModel):
    lineOrSection: str
    severity: Literal['low', 'medium', 'high'] = 'medium'
    reason: str

class ComplianceFlagCreate(ComplianceFlagBase):
    pass

class ComplianceFlagResponse(ComplianceFlagBase):
    id: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)

class VDRFileBase(BaseModel):
    name: str
    parentId: str | None = None
    isFolder: bool = False
    sizeBytes: int = 0
    mimeType: str = "application/octet-stream"
    fileExtension: str = ""
    sensitivity: SensitivityLevel = "Internal Only"

class VDRFileCreate(VDRFileBase):
    contentPreview: str | None = None

class FolderCreate(BaseModel):
    name: str
    parentId: str | None = None
    sensitivity: SensitivityLevel = "Internal Only"

class VDRFileUpdate(BaseModel):
    name: str | None = None
    sensitivity: SensitivityLevel | None = None

class PermissionsUpdate(BaseModel):
    permissions: dict[UserRole, RolePermissions]

class VDRFileResponse(VDRFileBase):
    id: str
    complianceFlags: list[ComplianceFlagResponse] = []
    permissions: dict[UserRole, RolePermissions] = {}
    createdAt: str
    updatedAt: str
    storageKey: str | None = None
    contentPreview: str | None = None

    model_config = ConfigDict(from_attributes=True)

class BreadcrumbItem(BaseModel):
    id: str | None = None
    name: str
    isRoot: bool = False

class TreeNode(BaseModel):
    id: str
    name: str
    isFolder: bool
    sensitivity: SensitivityLevel
    parentId: str | None = None
    children: list['TreeNode'] = []

class BatchDeleteRequest(BaseModel):
    fileIds: list[str]

class BatchTagRequest(BaseModel):
    fileIds: list[str]
    sensitivity: SensitivityLevel

class BatchOperationResponse(BaseModel):
    success: bool
    affectedCount: int
    affectedIds: list[str]
    message: str

class ActorSchema(BaseModel):
    id: str
    name: str
    role: UserRole
    avatarUrl: str | None = None

class AuditLogCreate(BaseModel):
    fileId: str
    fileName: str
    action: ActionType
    actor: ActorSchema
    details: str

class AuditLogResponse(AuditLogCreate):
    id: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: str
    name: str
    role: UserRole
    email: str
    avatarUrl: str | None = None

    model_config = ConfigDict(from_attributes=True)
