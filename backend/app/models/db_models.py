from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class FileModel(Base):
    __tablename__ = "files"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    parent_id = Column(String(64), ForeignKey("files.id", ondelete="CASCADE"), nullable=True, index=True)
    is_folder = Column(Boolean, default=False, nullable=False)
    size_bytes = Column(Integer, default=0, nullable=False)
    mime_type = Column(String(100), default="application/octet-stream", nullable=False)
    file_extension = Column(String(20), default="", nullable=False)
    sensitivity = Column(String(50), default="Internal Only", nullable=False, index=True)
    storage_key = Column(String(255), nullable=True)
    content_preview = Column(Text, nullable=True)
    created_at = Column(String(50), nullable=False)
    updated_at = Column(String(50), nullable=False)

    # Relationships
    children = relationship(
        "FileModel",
        backref="parent",
        remote_side=[id],
        cascade="all, delete-orphan",
        single_parent=True
    )
    compliance_flags = relationship(
        "ComplianceFlagModel",
        back_populates="file",
        cascade="all, delete-orphan",
        lazy="joined"
    )
    permissions = relationship(
        "PermissionModel",
        back_populates="file",
        cascade="all, delete-orphan",
        lazy="joined"
    )


class ComplianceFlagModel(Base):
    __tablename__ = "compliance_flags"

    id = Column(String(64), primary_key=True, index=True)
    file_id = Column(String(64), ForeignKey("files.id", ondelete="CASCADE"), nullable=False, index=True)
    line_or_section = Column(String(255), nullable=False)
    severity = Column(String(20), default="medium", nullable=False)
    reason = Column(Text, nullable=False)
    timestamp = Column(String(50), nullable=False)

    file = relationship("FileModel", back_populates="compliance_flags")


class PermissionModel(Base):
    __tablename__ = "permissions"

    id = Column(String(64), primary_key=True, index=True)
    file_id = Column(String(64), ForeignKey("files.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False, index=True)
    can_view = Column(Boolean, default=True, nullable=False)
    can_edit = Column(Boolean, default=False, nullable=False)
    can_share = Column(Boolean, default=False, nullable=False)

    file = relationship("FileModel", back_populates="permissions")


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    file_id = Column(String(64), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    action = Column(String(50), nullable=False, index=True)
    actor_id = Column(String(64), nullable=False)
    actor_name = Column(String(100), nullable=False)
    actor_role = Column(String(50), nullable=False, index=True)
    actor_avatar_url = Column(String(255), nullable=True)
    details = Column(Text, nullable=False)
    timestamp = Column(String(50), nullable=False, index=True)


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False, index=True)
    email = Column(String(150), nullable=False, unique=True)
    avatar_url = Column(String(255), nullable=True)
