import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_utc_now
from app.database import get_db
from app.models.db_models import ComplianceFlagModel, FileModel
from app.models.schemas import ComplianceFlagCreate, ComplianceFlagResponse
from app.services.audit_service import log_activity

router = APIRouter(prefix="/files", tags=["Compliance"])

@router.post("/{file_id}/flags", response_model=ComplianceFlagResponse)
def add_compliance_flag(
    file_id: str,
    payload: ComplianceFlagCreate,
    actorName: str = "Elena Rostova",
    actorRole: str = "Compliance Officer",
    db: Session = Depends(get_db)
):
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    flag_id = f"flag-{uuid.uuid4().hex[:8]}"
    now = get_utc_now()

    flag = ComplianceFlagModel(
        id=flag_id,
        file_id=file_id,
        line_or_section=payload.lineOrSection,
        severity=payload.severity,
        reason=payload.reason,
        timestamp=now
    )
    db.add(flag)
    db.commit()
    db.refresh(flag)

    log_activity(
        db=db,
        file_id=file_record.id,
        file_name=file_record.name,
        action="Flagged",
        details=f"Added {payload.severity.upper()} compliance flag at '{payload.lineOrSection}': {payload.reason}",
        actor_name=actorName,
        actor_role=actorRole # type: ignore
    )

    return ComplianceFlagResponse(
        id=flag.id,
        lineOrSection=flag.line_or_section,
        severity=flag.severity, # type: ignore
        reason=flag.reason,
        timestamp=flag.timestamp
    )

@router.delete("/{file_id}/flags/{flag_id}")
def remove_compliance_flag(
    file_id: str,
    flag_id: str,
    actorName: str = "Elena Rostova",
    actorRole: str = "Compliance Officer",
    db: Session = Depends(get_db)
):
    flag = db.query(ComplianceFlagModel).filter(
        ComplianceFlagModel.id == flag_id,
        ComplianceFlagModel.file_id == file_id
    ).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Compliance flag not found")

    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    file_name = file_record.name if file_record else "Document"

    db.delete(flag)
    db.commit()

    log_activity(
        db=db,
        file_id=file_id,
        file_name=file_name,
        action="Permission Changed",
        details=f"Resolved compliance flag '{flag.line_or_section}'",
        actor_name=actorName,
        actor_role=actorRole # type: ignore
    )

    return {"success": True, "resolvedFlagId": flag_id}
