import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.db_models import ComplianceFlagModel, FileModel, PermissionModel, UserModel

# In-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Creates a fresh database schema and session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Pre-seed users and default folders for tests
    now = "2026-08-27T22:00:00Z"
    users = [
        UserModel(id="usr-admin-01", name="Alexander Vance", role="Admin", email="admin@vdr.com", avatar_url=""),
        UserModel(id="usr-comp-02", name="Elena Rostova", role="Compliance Officer", email="elena@vdr.com", avatar_url=""),
        UserModel(id="usr-adv-03", name="Marcus Sterling", role="Advisor", email="marcus@vdr.com", avatar_url=""),
        UserModel(id="usr-aud-04", name="Sarah Chen", role="Auditor", email="sarah@vdr.com", avatar_url=""),
    ]
    session.add_all(users)

    # Seed test root folder
    root_folder = FileModel(
        id="test-folder-1",
        name="Test Portfolio",
        parent_id=None,
        is_folder=True,
        size_bytes=0,
        mime_type="inode/directory",
        file_extension="",
        sensitivity="Internal Only",
        created_at=now,
        updated_at=now
    )
    session.add(root_folder)

    # Seed test file
    test_file = FileModel(
        id="test-file-1",
        name="Quarterly_Report.txt",
        parent_id="test-folder-1",
        is_folder=False,
        size_bytes=1024,
        mime_type="text/plain",
        file_extension=".txt",
        sensitivity="Confidential",
        storage_key="test-key-1",
        content_preview="This is test report content.",
        created_at=now,
        updated_at=now
    )
    session.add(test_file)

    perms = [
        PermissionModel(id="perm-t1-adm", file_id=test_file.id, role="Admin", can_view=True, can_edit=True, can_share=True),
        PermissionModel(id="perm-t1-cmp", file_id=test_file.id, role="Compliance Officer", can_view=True, can_edit=True, can_share=True),
        PermissionModel(id="perm-t1-adv", file_id=test_file.id, role="Advisor", can_view=True, can_edit=False, can_share=False),
        PermissionModel(id="perm-t1-aud", file_id=test_file.id, role="Auditor", can_view=True, can_edit=False, can_share=False),
    ]
    session.add_all(perms)

    flag = ComplianceFlagModel(
        id="test-flag-1",
        file_id=test_file.id,
        line_or_section="Section 1.1",
        severity="high",
        reason="Test PII detected",
        timestamp=now
    )
    session.add(flag)

    session.commit()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
