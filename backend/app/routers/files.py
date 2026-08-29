import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from app.config import get_utc_now
from app.database import get_db
from app.models.db_models import FileModel, PermissionModel
from app.models.schemas import (
    BatchDeleteRequest,
    BatchOperationResponse,
    BatchTagRequest,
    SensitivityLevel,
    TreeNode,
    VDRFileResponse,
    VDRFileUpdate,
)
from app.services.audit_service import log_activity
from app.services.file_service import build_tree, delete_cascade, format_file_response
from app.services.minio_service import minio_service

router = APIRouter(prefix="/files", tags=["Files"])

@router.get("", response_model=list[VDRFileResponse])
def list_files(
    parentId: str | None = Query(None, description="Parent folder ID (omit or 'root' for top level)"),
    search: str | None = Query(None, description="Keyword search in file name"),
    sensitivity: str | None = Query(None, description="Filter by sensitivity tag"),
    fileType: str | None = Query(None, description="Filter by file extension e.g. .pdf"),
    sortBy: str | None = Query("name", description="Sort by: name, date, size, sensitivity"),
    sortOrder: str | None = Query("asc", description="Sort order: asc, desc"),
    db: Session = Depends(get_db)
):
    query = db.query(FileModel)

    actual_parent_id = None if (parentId in (None, "", "null", "root")) else parentId

    if search:
        query = query.filter(FileModel.name.ilike(f"%{search}%"))
    elif actual_parent_id is None:
        query = query.filter(FileModel.parent_id.is_(None))
    else:
        query = query.filter(FileModel.parent_id == actual_parent_id)

    if sensitivity:
        query = query.filter(FileModel.sensitivity == sensitivity)

    if fileType:
        if not fileType.startswith("."):
            fileType = f".{fileType}"
        query = query.filter(FileModel.file_extension.ilike(fileType))

    files = query.all()

    sensitivity_order = {"Confidential": 4, "Restricted": 3, "Internal Only": 2, "Public": 1}
    reverse = (sortOrder.lower() == "desc")
    if sortBy == "name":
        files = sorted(files, key=lambda x: (not x.is_folder, x.name.lower()), reverse=reverse)
    elif sortBy == "date":
        files = sorted(files, key=lambda x: (not x.is_folder, x.updated_at), reverse=reverse)
    elif sortBy == "size":
        files = sorted(files, key=lambda x: (not x.is_folder, x.size_bytes), reverse=reverse)
    elif sortBy == "sensitivity":
        files = sorted(files, key=lambda x: (not x.is_folder, sensitivity_order.get(x.sensitivity, 0)), reverse=reverse)

    return [format_file_response(f) for f in files]

@router.get("/tree", response_model=list[TreeNode])
def get_file_tree(db: Session = Depends(get_db)):
    """Returns the recursive hierarchical directory tree."""
    return build_tree(db, parent_id=None)

@router.get("/{file_id}", response_model=VDRFileResponse)
def get_file(file_id: str, db: Session = Depends(get_db)):
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    if not file_record.is_folder:
        log_activity(
            db=db,
            file_id=file_record.id,
            file_name=file_record.name,
            action="Viewed",
            details=f"Viewed file '{file_record.name}' in previewer"
        )

    return format_file_response(file_record)

@router.post("/upload", response_model=VDRFileResponse)
async def upload_file(
    file: UploadFile = File(...),
    parentId: str | None = Form(None),
    sensitivity: SensitivityLevel = Form("Internal Only"),
    actorName: str | None = Form(None),
    actorRole: str | None = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename cannot be empty")

    actual_parent_id = None if (parentId in (None, "", "null", "root")) else parentId
    file_id = f"file-{uuid.uuid4().hex[:8]}"
    now = get_utc_now()
    _, ext = os.path.splitext(file.filename)

    contents = await file.read()
    object_key = f"{file_id}-{file.filename}"
    minio_service.upload_file(
        object_name=object_key,
        data=contents,
        content_type=file.content_type or "application/octet-stream"
    )

    content_preview = None
    if ext.lower() in [".txt", ".md", ".json", ".csv"]:
        try:
            content_preview = contents.decode("utf-8", errors="replace")[:50000]
        except Exception:
            content_preview = None

    new_file = FileModel(
        id=file_id,
        name=file.filename,
        parent_id=actual_parent_id,
        is_folder=False,
        size_bytes=len(contents),
        mime_type=file.content_type or "application/octet-stream",
        file_extension=ext,
        sensitivity=sensitivity,
        storage_key=object_key,
        content_preview=content_preview,
        created_at=now,
        updated_at=now
    )
    db.add(new_file)

    perms = [
        PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=file_id, role="Admin", can_view=True, can_edit=True, can_share=True),
        PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=file_id, role="Compliance Officer", can_view=True, can_edit=True, can_share=True),
        PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=file_id, role="Advisor", can_view=True, can_edit=False, can_share=False),
        PermissionModel(id=f"perm-{uuid.uuid4().hex[:8]}", file_id=file_id, role="Auditor", can_view=True, can_edit=False, can_share=False),
    ]
    db.add_all(perms)
    db.commit()
    db.refresh(new_file)

    log_activity(
        db=db,
        file_id=new_file.id,
        file_name=new_file.name,
        action="Uploaded",
        details=f"Uploaded {new_file.name} ({len(contents)} bytes, {sensitivity})",
        actor_name=actorName,
        actor_role=actorRole # type: ignore
    )

    return format_file_response(new_file)

@router.get("/{file_id}/content")
def get_file_content(file_id: str, download: bool = False, db: Session = Depends(get_db)):
    """Streams file content directly or returns raw text."""
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    disposition = "attachment" if download else "inline"
    if file_record.storage_key:
        stream = minio_service.get_file_stream(file_record.storage_key)
        if stream:
            return StreamingResponse(
                stream,
                media_type=file_record.mime_type,
                headers={"Content-Disposition": f'{disposition}; filename="{file_record.name}"'}
            )

    if file_record.content_preview:
        return Response(
            content=file_record.content_preview,
            media_type=file_record.mime_type,
            headers={"Content-Disposition": f'{disposition}; filename="{file_record.name}"'} if download else None
        )

    raise HTTPException(status_code=404, detail="Document content unavailable")

@router.get("/{file_id}/download-url")
def get_download_url(file_id: str, db: Session = Depends(get_db)):
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    download_url = f"http://localhost:8000/api/v1/files/{file_record.id}/content?download=true"

    log_activity(
        db=db,
        file_id=file_record.id,
        file_name=file_record.name,
        action="Downloaded",
        details=f"Generated download access for '{file_record.name}'"
    )

    return {"downloadUrl": download_url, "fileName": file_record.name, "sizeBytes": file_record.size_bytes}


@router.patch("/{file_id}", response_model=VDRFileResponse)
def update_file(
    file_id: str,
    updates: VDRFileUpdate,
    actorName: str | None = Query(None),
    actorRole: str | None = Query(None),
    db: Session = Depends(get_db)
):
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    old_name = file_record.name
    old_sens = file_record.sensitivity

    if updates.name is not None and updates.name.strip():
        file_record.name = updates.name.strip()
        _, ext = os.path.splitext(file_record.name)
        file_record.file_extension = ext
        log_activity(
            db=db,
            file_id=file_record.id,
            file_name=file_record.name,
            action="Renamed",
            details=f"Renamed from '{old_name}' to '{file_record.name}'",
            actor_name=actorName,
            actor_role=actorRole # type: ignore
        )

    if updates.sensitivity is not None and updates.sensitivity != old_sens:
        file_record.sensitivity = updates.sensitivity
        log_activity(
            db=db,
            file_id=file_record.id,
            file_name=file_record.name,
            action="Permission Changed",
            details=f"Changed sensitivity level from '{old_sens}' to '{updates.sensitivity}'",
            actor_name=actorName,
            actor_role=actorRole # type: ignore
        )

    file_record.updated_at = get_utc_now()
    db.commit()
    db.refresh(file_record)
    return format_file_response(file_record)

@router.delete("/{file_id}")
def delete_file(
    file_id: str,
    actorName: str | None = Query(None),
    actorRole: str | None = Query(None),
    db: Session = Depends(get_db)
):
    file_record = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    file_name = file_record.name
    deleted_ids = delete_cascade(db, file_id)
    db.commit()

    log_activity(
        db=db,
        file_id=file_id,
        file_name=file_name,
        action="Deleted",
        details=f"Deleted '{file_name}' and {len(deleted_ids) - 1} nested sub-items",
        actor_name=actorName,
        actor_role=actorRole # type: ignore
    )

    return {"success": True, "deletedCount": len(deleted_ids), "deletedIds": deleted_ids}

@router.post("/batch-delete", response_model=BatchOperationResponse)
def batch_delete(payload: BatchDeleteRequest, db: Session = Depends(get_db)):
    all_deleted = []
    for fid in payload.fileIds:
        deleted = delete_cascade(db, fid)
        all_deleted.extend(deleted)

    db.commit()
    return BatchOperationResponse(
        success=True,
        affectedCount=len(all_deleted),
        affectedIds=all_deleted,
        message=f"Successfully deleted {len(all_deleted)} item(s)."
    )

@router.post("/batch-tag", response_model=BatchOperationResponse)
def batch_tag(
    payload: BatchTagRequest,
    actorName: str | None = Query(None),
    actorRole: str | None = Query(None),
    db: Session = Depends(get_db)
):
    files = db.query(FileModel).filter(FileModel.id.in_(payload.fileIds)).all()
    for f in files:
        f.sensitivity = payload.sensitivity
        f.updated_at = get_utc_now()
        log_activity(
            db=db,
            file_id=f.id,
            file_name=f.name,
            action="Permission Changed",
            details=f"Bulk updated sensitivity tag to '{payload.sensitivity}'",
            actor_name=actorName,
            actor_role=actorRole # type: ignore
        )

    db.commit()
    return BatchOperationResponse(
        success=True,
        affectedCount=len(files),
        affectedIds=[f.id for f in files],
        message=f"Updated sensitivity to '{payload.sensitivity}' for {len(files)} item(s)."
    )
