
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_utc_now
from app.database import get_db
from app.models.db_models import FileModel, PermissionModel
from app.models.schemas import PermissionsUpdate, RolePermissions, UserRole, VDRFileResponse
from app.services.audit_service import log_activity
from app.services.file_service import format_file_response

router = APIRouter(prefix="/files", tags=["Permissions"])

@router.get("/{file_id}/permissions", response_model=dict[UserRole, RolePermissions])
def get_file_permissions(file_id: str, db: Session = Depends(get_db)):
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File or folder not found")

    res = format_file_response(file_record)
    return res.permissions

@router.put("/{file_id}/permissions", response_model=VDRFileResponse)
def update_file_permissions(
    file_id: str,
    payload: PermissionsUpdate,
    actorName: str = "Elena Rostova",
    actorRole: str = "Compliance Officer",
    db: Session = Depends(get_db)
):
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File or folder not found")

    # Clear existing permissions and re-insert updated matrix
    db.query(PermissionModel).filter(PermissionModel.file_id == file_id).delete()

    for role_name, perms in payload.permissions.items():
        perm_entry = PermissionModel(
            id=f"perm-{file_id[:8]}-{role_name[:4]}",
            file_id=file_id,
            role=role_name,
            can_view=perms.canView,
            can_edit=perms.canEdit,
            can_share=perms.canShare
        )
        db.add(perm_entry)

    file_record.updated_at = get_utc_now()
    db.commit()
    db.refresh(file_record)

    log_activity(
        db=db,
        file_id=file_record.id,
        file_name=file_record.name,
        action="Permission Changed",
        details=f"Updated role access rights matrix for '{file_record.name}'",
        actor_name=actorName,
        actor_role=actorRole # type: ignore
    )

    return format_file_response(file_record)
