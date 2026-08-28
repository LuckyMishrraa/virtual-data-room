from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.db_models import AuditLogModel
from app.models.schemas import AuditLogCreate, AuditLogResponse
from app.services.audit_service import log_activity

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    fileId: Optional[str] = Query(None, description="Filter logs by target document/folder ID"),
    role: Optional[str] = Query(None, description="Filter logs by actor role"),
    action: Optional[str] = Query(None, description="Filter logs by action type"),
    limit: int = Query(50, ge=1, le=500, description="Max records to return"),
    skip: int = Query(0, ge=0, description="Offset"),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLogModel)

    if fileId:
        query = query.filter(AuditLogModel.file_id == fileId)
    if role:
        query = query.filter(AuditLogModel.actor_role == role)
    if action:
        query = query.filter(AuditLogModel.action == action)

    logs = query.order_by(AuditLogModel.timestamp.desc()).offset(skip).limit(limit).all()

    return [
        AuditLogResponse(
            id=log.id,
            fileId=log.file_id,
            fileName=log.file_name,
            action=log.action, # type: ignore
            actor={
                "id": log.actor_id,
                "name": log.actor_name,
                "role": log.actor_role, # type: ignore
                "avatarUrl": log.actor_avatar_url
            },
            details=log.details,
            timestamp=log.timestamp
        )
        for log in logs
    ]

@router.post("", response_model=AuditLogResponse)
def record_audit_log(payload: AuditLogCreate, db: Session = Depends(get_db)):
    """Allows recording client-side interactions."""
    entry = log_activity(
        db=db,
        file_id=payload.fileId,
        file_name=payload.fileName,
        action=payload.action,
        details=payload.details,
        actor_id=payload.actor.id,
        actor_name=payload.actor.name,
        actor_role=payload.actor.role,
        actor_avatar_url=payload.actor.avatarUrl
    )
    return AuditLogResponse(
        id=entry.id,
        fileId=entry.file_id,
        fileName=entry.file_name,
        action=entry.action, # type: ignore
        actor={
            "id": entry.actor_id,
            "name": entry.actor_name,
            "role": entry.actor_role, # type: ignore
            "avatarUrl": entry.actor_avatar_url
        },
        details=entry.details,
        timestamp=entry.timestamp
    )
