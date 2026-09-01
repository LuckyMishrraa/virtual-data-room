---
name: vdr-backend-practices
description: >-
  Best practices and architectural standards for the Virtual Data Room FastAPI & MinIO backend.
  Use when designing REST endpoints, SQLAlchemy 2.0 database models, MinIO S3 object streaming,
  immutable audit logging, RBAC matrix validation, and automated pytest suites.
---

# VDR Backend Best Practices & Engineering Guidelines

This skill defines the architectural patterns, security controls, and storage rules for the **Virtual Data Room (VDR)** FastAPI backend.

---

## 🏛️ 1. Architecture & Technology Stack

* **Framework**: FastAPI (Python 3.11 / 3.14 compatible)
* **ORM & Database**: SQLAlchemy 2.0 (declarative Base, SQLite in dev / PostgreSQL in prod)
* **Storage Engine**: MinIO S3-compatible object storage (`vdr-documents` bucket)
* **Data Validation**: Pydantic v2 schemas (`BaseModel`, `ConfigDict(from_attributes=True)`)
* **Testing**: Pytest + `TestClient` (`tests/` test suite)

---

## 📂 2. Directory Layout & Module Structure

```text
backend/
├── app/
│   ├── config.py           # Pydantic BaseSettings & UTC helpers
│   ├── database.py         # SQLAlchemy engine, session generator & DB seeder
│   ├── main.py             # FastAPI entrypoint, CORS, lifespan & router registration
│   ├── models/
│   │   ├── db_models.py    # SQLAlchemy table declarations (FileModel, AuditLogModel, etc.)
│   │   └── schemas.py      # Pydantic input/output schemas
│   ├── routers/            # API endpoints (files, folders, permissions, compliance, audit, users)
│   └── services/           # Business logic (minio_service, file_service, audit_service)
└── tests/                  # Pytest test cases
```

---

## 🔒 3. Storage & MinIO S3 Rules

1. **Object Key Strategy**: Generate deterministic, unique keys using `{file_id}-{filename}` to avoid namespace collisions.
2. **Presigned URL Domain Resolution**:
   - Docker internal MinIO hostname is `minio:9000`.
   - When generating presigned download URLs for client browsers, replace `minio:9000` with `localhost:9000` (`MINIO_PUBLIC_ENDPOINT`).
3. **Streaming Responses**: For zero-download preview and raw content streaming, use FastAPI `StreamingResponse` with appropriate `Content-Type` and `Content-Disposition: inline`.
4. **Cascade Storage Cleanup**: When a file or folder is deleted, always remove the binary object from MinIO alongside the database row.

---

## 📜 4. Immutable Audit Logging Standard

Every operational mutation MUST trigger an audit log entry via `log_activity()`:

```python
log_activity(
    db=db,
    file_id=file.id,
    file_name=file.name,
    action="Uploaded", # Allowed: Uploaded, Viewed, Downloaded, Flagged, Renamed, Permission Changed, Deleted
    details=f"Uploaded {file.name} ({len(contents)} bytes, {sensitivity})",
    actor_name=actor_name,
    actor_role=actor_role
)
```

### Standard Action Types:
* `Uploaded` — File upload or folder creation.
* `Viewed` — Opening document in the zero-download previewer.
* `Downloaded` — Generating presigned download link.
* `Flagged` — Adding a regulatory compliance violation marker.
* `Renamed` — Renaming file or folder.
* `Permission Changed` — Updating sensitivity or 4x3 role permission matrix.
* `Deleted` — Deleting file or folder.

---

## 🧪 5. Testing & Quality Standards

1. **Test Isolation**: Every test run must operate in an isolated SQLite memory database or temporary test session.
2. **Status Code Conventions**:
   - `200 OK`: Successful read/update.
   - `201 Created`: Successful creation (e.g. upload, new folder).
   - `400 Bad Request`: Validation failure (empty names, invalid formats).
   - `404 Not Found`: File/folder does not exist.
   - `409 Conflict`: Duplicate folder name in the same parent directory.
3. **Running the Suite**:
   ```bash
   pytest tests -v
   ```
