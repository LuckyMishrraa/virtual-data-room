import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config import get_utc_now
from app.database import get_db
from app.models.db_models import FileModel, PermissionModel
from app.models.schemas import FolderCreate, VDRFileResponse, BreadcrumbItem
from app.services.file_service import format_file_response, get_breadcrumbs, delete_cascade
from app.services.audit_service import log_activity

router = APIRouter(prefix="/folders", tags=["Folders"])

@router.post("", response_model=VDRFileResponse)
def create_folder(payload: FolderCreate, db: Session = Depends(get_db)):
    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=400, detail="Folder name cannot be empty")

    actual_parent_id = None if payload.parentId in (None, "", "null", "root") else payload.parentId
    folder_name = payload.name.strip()

    if actual_parent_id:
        parent = db.query(FileModel).filter(FileModel.id == actual_parent_id, FileModel.is_folder == True).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent folder not found")

    existing = db.query(FileModel).filter(
        FileModel.parent_id == actual_parent_id,
        FileModel.is_folder == True,
        FileModel.name.ilike(folder_name)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"A folder named '{folder_name}' already exists in this location")

    folder_id = f"folder-{uuid.uuid4().hex[:8]}"
    now = get_utc_now()

    folder = FileModel(
        id=folder_id,
        name=folder_name,
        parent_id=actual_parent_id,
        is_folder=True,
        size_bytes=0,
        mime_type="inode/directory",
        file_extension="",
        sensitivity=payload.sensitivity,
        created_at=now,
        updated_at=now,
    )
    db.add(folder)

    perms = [
        PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=folder_id, role="Admin", can_view=True, can_edit=True, can_share=True),
        PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=folder_id, role="Compliance Officer", can_view=True, can_edit=True, can_share=True),
        PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=folder_id, role="Advisor", can_view=True, can_edit=False, can_share=False),
        PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=folder_id, role="Auditor", can_view=True, can_edit=False, can_share=False),
    ]
    db.add_all(perms)
    db.commit()
    db.refresh(folder)

    log_activity(
        db=db,
        file_id=folder.id,
        file_name=folder.name,
        action="Uploaded",
        details=f"Created folder '{folder.name}' with sensitivity {folder.sensitivity}"
    )

    return format_file_response(folder)

@router.get("/breadcrumbs/{folder_id}", response_model=List[BreadcrumbItem])
def get_folder_breadcrumbs(folder_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Returns ordered breadcrumb path from Root to the requested folder."""
    if folder_id in ("root", "null", "none"):
        folder_id = None
    return get_breadcrumbs(db, folder_id)

@router.delete("/{folder_id}")
def delete_folder(folder_id: str, db: Session = Depends(get_db)):
    folder = db.query(FileModel).filter(FileModel.id == folder_id, FileModel.is_folder == True).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    folder_name = folder.name
    deleted_ids = delete_cascade(db, folder_id)
    db.commit()

    log_activity(
        db=db,
        file_id=folder_id,
        file_name=folder_name,
        action="Deleted",
        details=f"Deleted folder '{folder_name}' and {len(deleted_ids) - 1} nested sub-items"
    )

    return {"success": True, "deletedCount": len(deleted_ids), "deletedIds": deleted_ids}
