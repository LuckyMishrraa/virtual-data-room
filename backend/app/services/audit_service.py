import uuid

from sqlalchemy.orm import Session

from app.config import get_utc_now
from app.models.db_models import AuditLogModel
from app.models.schemas import ActionType, UserRole


def log_activity(
    db: Session,
    file_id: str,
    file_name: str,
    action: ActionType,
    details: str,
    actor_id: str | None = None,
    actor_name: str | None = None,
    actor_role: UserRole | None = None,
    actor_avatar_url: str | None = None
) -> AuditLogModel:
    """Standardized helper to record an immutable audit log entry in the database."""
    log_entry = AuditLogModel(
        id=f"audit-{uuid.uuid4().hex[:8]}",
        file_id=file_id,
        file_name=file_name,
        action=action,
        actor_id=actor_id or "usr-comp-02",
        actor_name=actor_name or "Elena Rostova",
        actor_role=actor_role or "Compliance Officer",
        actor_avatar_url=actor_avatar_url or "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        details=details,
        timestamp=get_utc_now()
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
