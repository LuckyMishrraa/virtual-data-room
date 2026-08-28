from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.models.db_models import FileModel, PermissionModel, ComplianceFlagModel
from app.models.schemas import (
    VDRFileResponse, ComplianceFlagResponse, BreadcrumbItem,
    TreeNode, RolePermissions, UserRole
)
from app.services.minio_service import minio_service

def format_file_response(file: FileModel) -> VDRFileResponse:
    """Formats SQLAlchemy FileModel into VDRFileResponse with parsed permissions dict and compliance flags."""
    perm_dict: Dict[UserRole, RolePermissions] = {
        "Admin": RolePermissions(canView=True, canEdit=True, canShare=True),
        "Compliance Officer": RolePermissions(canView=True, canEdit=True, canShare=True),
        "Advisor": RolePermissions(canView=True, canEdit=False, canShare=False),
        "Auditor": RolePermissions(canView=True, canEdit=False, canShare=False),
    }

    if file.permissions:
        for p in file.permissions:
            perm_dict[p.role] = RolePermissions(
                canView=p.can_view,
                canEdit=p.can_edit,
                canShare=p.can_share
            )

    flags = [
        ComplianceFlagResponse(
            id=cf.id,
            lineOrSection=cf.line_or_section,
            severity=cf.severity, # type: ignore
            reason=cf.reason,
            timestamp=cf.timestamp
        )
        for cf in file.compliance_flags
    ] if file.compliance_flags else []

    return VDRFileResponse(
        id=file.id,
        name=file.name,
        parentId=file.parent_id,
        isFolder=file.is_folder,
        sizeBytes=file.size_bytes,
        mimeType=file.mime_type,
        fileExtension=file.file_extension,
        sensitivity=file.sensitivity, # type: ignore
        complianceFlags=flags,
        permissions=perm_dict,
        createdAt=file.created_at,
        updatedAt=file.updated_at,
        storageKey=file.storage_key,
        contentPreview=file.content_preview
    )

def get_breadcrumbs(db: Session, folder_id: Optional[str]) -> List[BreadcrumbItem]:
    """Builds an ordered breadcrumb trail from Root down to the specified folder."""
    crumbs: List[BreadcrumbItem] = [BreadcrumbItem(id=None, name="Home", isRoot=True)]
    if not folder_id:
        return crumbs

    current_id = folder_id
    trail: List[BreadcrumbItem] = []
    
    # Traverse upwards
    visited = set()
    while current_id and current_id not in visited:
        visited.add(current_id)
        folder = db.query(FileModel).filter(FileModel.id == current_id, FileModel.is_folder == True).first()
        if not folder:
            break
        trail.append(BreadcrumbItem(id=folder.id, name=folder.name, isRoot=False))
        current_id = folder.parent_id

    trail.reverse()
    return crumbs + trail

def build_tree(db: Session, parent_id: Optional[str] = None) -> List[TreeNode]:
    """Recursively builds tree nodes for directory tree sidebar."""
    items = db.query(FileModel).filter(FileModel.parent_id == parent_id).order_by(FileModel.is_folder.desc(), FileModel.name.asc()).all()
    tree: List[TreeNode] = []

    for item in items:
        node = TreeNode(
            id=item.id,
            name=item.name,
            isFolder=item.is_folder,
            sensitivity=item.sensitivity, # type: ignore
            parentId=item.parent_id,
            children=build_tree(db, item.id) if item.is_folder else []
        )
        tree.append(node)

    return tree

def delete_cascade(db: Session, file_id: str) -> List[str]:
    """Deletes a file or folder along with all nested children and MinIO assets."""
    deleted_ids = []
    item = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not item:
        return deleted_ids

    # If folder, recursively delete children
    if item.is_folder:
        children = db.query(FileModel).filter(FileModel.parent_id == file_id).all()
        for child in children:
            deleted_ids.extend(delete_cascade(db, child.id))

    # Delete storage binary if present
    if item.storage_key:
        minio_service.delete_file(item.storage_key)

    deleted_ids.append(item.id)
    db.delete(item)
    return deleted_ids
