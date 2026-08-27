from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field, ConfigDict

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
    parentId: Optional[str] = None
    isFolder: bool = False
    sizeBytes: int = 0
    mimeType: str = "application/octet-stream"
    fileExtension: str = ""
    sensitivity: SensitivityLevel = "Internal Only"

class VDRFileCreate(VDRFileBase):
    contentPreview: Optional[str] = None

class FolderCreate(BaseModel):
    name: str
    parentId: Optional[str] = None
    sensitivity: SensitivityLevel = "Internal Only"

class VDRFileUpdate(BaseModel):
    name: Optional[str] = None
    sensitivity: Optional[SensitivityLevel] = None

class PermissionsUpdate(BaseModel):
    permissions: Dict[UserRole, RolePermissions]

class VDRFileResponse(VDRFileBase):
    id: str
    complianceFlags: List[ComplianceFlagResponse] = []
    permissions: Dict[UserRole, RolePermissions] = {}
    createdAt: str
    updatedAt: str
    storageKey: Optional[str] = None
    contentPreview: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class BreadcrumbItem(BaseModel):
    id: Optional[str] = None
    name: str
    isRoot: bool = False

class TreeNode(BaseModel):
    id: str
    name: str
    isFolder: bool
    sensitivity: SensitivityLevel
    parentId: Optional[str] = None
    children: List['TreeNode'] = []

class BatchDeleteRequest(BaseModel):
    fileIds: List[str]

class BatchTagRequest(BaseModel):
    fileIds: List[str]
    sensitivity: SensitivityLevel

class BatchOperationResponse(BaseModel):
    success: bool
    affectedCount: int
    affectedIds: List[str]
    message: str

class ActorSchema(BaseModel):
    id: str
    name: str
    role: UserRole
    avatarUrl: Optional[str] = None

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
    avatarUrl: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
