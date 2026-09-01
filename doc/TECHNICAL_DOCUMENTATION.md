# Acumen Virtual Data Room (VDR) — Technical Documentation

> Audience: engineers and future maintainers.
> Scope: this document describes **what is actually implemented in the codebase today** (backend `backend/app/`, frontend `frontend/src/`), verified by direct source inspection. It intentionally excludes aspirational/planned features that appear in the `doc/` planning files (PRD, user stories, roadmap) but do not exist in code. See [§8 Known Gaps & Limitations](#8-known-gaps--limitations) for an explicit list of what's planned-but-not-built.

---

## 1. Overview & Architecture

Acumen VDR is a three-tier web application: a Next.js single-page frontend, a FastAPI backend exposing a REST API under `/api/v1`, a relational database for metadata, and MinIO (S3-compatible object storage) for file binaries. All four run as separate Docker Compose services in the reference deployment.

There is **no authentication layer**. "Roles" are a client-side UI concept — a role switcher in the top navbar lets anyone impersonate any of the four seeded personas. The chosen role is sent to the backend as a plain string on relevant requests (for audit-log attribution only) and is never verified server-side. See [§5](#5-rbac--security-model) for the full implication.

### 1.1 Topology

```mermaid
graph TD
    subgraph Browser
        UI["Next.js 16 App<br/>(React 19, Zustand, Tailwind)"]
    end

    subgraph "Docker Compose network: vdr-network"
        FE["frontend container<br/>next start :3000"]
        BE["backend container<br/>uvicorn app.main:app :8000"]
        DB[("SQLite file<br/>/app/data/vdr.db<br/>(volume: backend_data)")]
        MINIO[("MinIO<br/>S3 API :9000 / Console :9001<br/>(volume: minio_data)")]
        INIT["minio-init<br/>one-shot mc bucket bootstrap"]
    end

    UI -->|"HTTP :3000"| FE
    FE -->|"fetch() REST calls<br/>NEXT_PUBLIC_API_URL"| BE
    BE -->|"SQLAlchemy 2.0 ORM"| DB
    BE -->|"minio-py SDK<br/>put_object / get_object"| MINIO
    INIT -.->|"creates bucket<br/>vdr-documents on startup"| MINIO
```

### 1.2 Request flow, at a glance

1. The browser loads the Next.js app (`frontend/src/app/page.tsx`), which on mount calls `fetchInitialData()` in the Zustand store.
2. The store calls `vdrApi` (`frontend/src/lib/api/vdrApi.ts`), a thin `fetch()` wrapper, which hits `http://localhost:8000/api/v1/...` (configurable via `NEXT_PUBLIC_API_URL`).
3. FastAPI routers (`backend/app/routers/*.py`) handle the request, using SQLAlchemy sessions (`backend/app/database.py`) to read/write the `files`, `permissions`, `compliance_flags`, `audit_logs`, and `users` tables.
4. File binaries never touch the relational DB — they are streamed to/from MinIO via `backend/app/services/minio_service.py`. Only metadata (name, size, MIME type, the MinIO object key) lives in the `files` table.
5. Every mutating action calls `log_activity()` (`backend/app/services/audit_service.py`), which writes an immutable row to `audit_logs`.

---

## 2. Tech Stack

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| Frontend framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 | Single page (`app/page.tsx`), client-rendered (`"use client"` throughout) |
| Frontend state | Zustand 5 | One flat store, `frontend/src/store/useVDRStore.ts` — no context, no redux |
| Frontend styling | Tailwind CSS 4, `lucide-react` icons | CSS-variable design tokens for light/dark theme |
| Backend framework | FastAPI 0.115+, Uvicorn, Python 3.11 | Routers registered under `/api/v1` in `backend/app/main.py` |
| Validation | Pydantic v2 | `backend/app/models/schemas.py` |
| ORM | SQLAlchemy 2.0 (declarative) | `backend/app/models/db_models.py` |
| Database | SQLite by default (`sqlite:///./vdr.db` or `/app/data/vdr.db` in Docker); `DATABASE_URL` also accepts Postgres and `psycopg2-binary` is a dependency, but no Postgres-specific code or migration path exists | `backend/app/database.py`, `backend/app/config.py` |
| Object storage | MinIO (S3-compatible), `minio` Python SDK 7.2+ | `backend/app/services/minio_service.py` |
| Testing (backend) | Pytest, httpx, pytest-asyncio | `backend/tests/*.py` — files, folders, permissions, compliance, audit, users |
| Testing (frontend) | None found | No `*.test.*` / `*.spec.*` files exist in `frontend/src` |
| Orchestration | Docker Compose (`docker-compose.yml`) | 4 services: `frontend`, `backend`, `minio`, `minio-init` |

---

## 3. Data Model

Defined in `backend/app/models/db_models.py`. Five tables, all keyed by string IDs generated as `{prefix}-{uuid4 hex[:8]}` (e.g. `file-a1b2c3d4`).

```mermaid
erDiagram
    FileModel ||--o{ FileModel : "parent_id (self-referential, CASCADE)"
    FileModel ||--o{ ComplianceFlagModel : "file_id (CASCADE)"
    FileModel ||--o{ PermissionModel : "file_id (CASCADE)"
    AuditLogModel }o--|| FileModel : "file_id (no FK constraint)"
    UserModel {
        string id PK
        string name
        string role
        string email UK
        string avatar_url
    }

    FileModel {
        string id PK
        string name
        string parent_id FK
        bool is_folder
        int size_bytes
        string mime_type
        string file_extension
        string sensitivity
        string storage_key "MinIO object key, null for folders"
        text content_preview "cached UTF-8 text for txt/md/json/csv, up to 50000 chars"
        string created_at "ISO-8601 string, not a native datetime"
        string updated_at
    }

    ComplianceFlagModel {
        string id PK
        string file_id FK
        string line_or_section
        string severity "low | medium | high"
        text reason
        string timestamp
    }

    PermissionModel {
        string id PK
        string file_id FK
        string role
        bool can_view
        bool can_edit
        bool can_share
    }

    AuditLogModel {
        string id PK
        string file_id "no FK constraint — target may no longer exist"
        string file_name
        string action
        string actor_id
        string actor_name
        string actor_role
        string actor_avatar_url
        text details
        string timestamp
    }
```

Notable design choices (verified in code, not assumed):

- **A folder and a file are the same table row** (`FileModel.is_folder`). Folders have `mime_type="inode/directory"`, `storage_key=None`, and use `FileModel.children` (a self-referential relationship on `parent_id`) for hierarchy.
- **Cascade deletion** is handled two ways: SQLAlchemy's `cascade="all, delete-orphan"` on `FileModel.children`/`compliance_flags`/`permissions` for ORM-level cleanup, *and* an explicit recursive `delete_cascade()` function in `backend/app/services/file_service.py` that walks the tree and also calls `minio_service.delete_file()` for each item's binary — this is what the delete endpoints actually call, not the ORM cascade alone.
- **`AuditLogModel.file_id` has no foreign key constraint.** Audit rows are meant to outlive their target file (so a deleted document's history remains visible), which the schema achieves simply by not constraining it.
- **Timestamps are ISO-8601 strings** (`get_utc_now()` in `backend/app/config.py`), not native SQL datetime columns — sorting relies on lexical string ordering, which works because the format is zero-padded and always UTC (`Z` suffix).
- **`PermissionModel` rows are seeded per-file at creation time** (4 rows per file/folder, one per role) rather than inherited from a folder-level policy at read time. Changing a folder's permissions does **not** cascade to its existing children.
- A legacy, unused module `backend/app/services/db_service.py` defines an `InMemoryDatabase` mock (leftover from an earlier mock-data development phase per `doc/QA.md`). It is never imported by `main.py` or any router and is dead code; it also references a `ComplianceFlag` Pydantic model that no longer exists in `schemas.py`; do not extend it.

---

## 4. REST API Reference

Base path: `settings.API_V1_STR` = `/api/v1`. Interactive docs at `/docs` (Swagger) and `/redoc`. No versioning beyond the `v1` prefix; no auth headers on any route.

### 4.1 Files — `backend/app/routers/files.py`

| Method | Path | Purpose | Key behavior |
| :--- | :--- | :--- | :--- |
| `GET` | `/files` | List files/folders in a folder, or search | `parentId` (omit/`root`/`null` = top level); `search` (substring, `ilike`, searches *all* folders, not just current one); `sensitivity`, `fileType` filters; `sortBy` (`name`\|`date`\|`size`\|`sensitivity`) + `sortOrder`. Folders always sort before files within a sort key. |
| `GET` | `/files/tree` | Full recursive folder tree | Used by the sidebar; returns `TreeNode[]`, folders only need `isFolder`/`children` |
| `GET` | `/files/{id}` | Single file/folder metadata | **Side effect:** logs a `"Viewed"` audit event if the item is not a folder |
| `POST` | `/files/upload` | Multipart upload | Streams binary to MinIO as `{fileId}-{filename}`, decodes and caches first 50,000 chars of text-like files (`.txt/.md/.json/.csv`) into `content_preview`, creates 4 `PermissionModel` rows (Admin/Compliance Officer = full; Advisor/Auditor = view-only, no edit/share), logs `"Uploaded"` |
| `GET` | `/files/{id}/content` | Stream file bytes | `download=true` sets `Content-Disposition: attachment`, else `inline`. Falls back to `content_preview` text if no MinIO stream is available. **No audit log is written by this endpoint** — viewing raw content via this route is silent |
| `GET` | `/files/{id}/download-url` | "Generate" a download link | Returns a **hardcoded backend URL** (`http://localhost:8000/api/v1/files/{id}/content?download=true`), not a real MinIO presigned URL — see [§8](#8-known-gaps--limitations). Logs `"Downloaded"` |
| `PATCH` | `/files/{id}` | Rename and/or change sensitivity | Two independent audit events possible in one call: `"Renamed"` if `name` changed, `"Permission Changed"` if `sensitivity` changed |
| `DELETE` | `/files/{id}` | Delete file or folder + descendants | Calls `delete_cascade()`; deletes MinIO objects too; logs one `"Deleted"` event for the root item |
| `POST` | `/files/batch-delete` | Bulk delete by ID list | Same cascade logic per ID; **no audit log entries are written for batch delete** |
| `POST` | `/files/batch-tag` | Bulk sensitivity change | One `"Permission Changed"` audit entry **per file** |

### 4.2 Folders — `backend/app/routers/folders.py`

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `POST` | `/folders` | Create folder. Rejects empty names and case-insensitive duplicate names within the same parent (`409`). Seeds the same 4-role permission set as file upload. Logs action `"Uploaded"` (not `"Created"` — there is no distinct folder-creation action type). |
| `GET` | `/folders/breadcrumbs/{folder_id}` | Walks `parent_id` upward to build the path, prepends a synthetic `Home` root crumb |
| `DELETE` | `/folders/{folder_id}` | Same cascade delete as `DELETE /files/{id}`, restricted to `is_folder=True` rows |

There is **no move or copy endpoint**. Reorganizing the tree requires delete + re-upload.

### 4.3 Permissions — `backend/app/routers/permissions.py`

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/files/{id}/permissions` | Returns the 4-role matrix for one file |
| `PUT` | `/files/{id}/permissions` | Replaces the entire matrix (delete-then-reinsert). `actorName`/`actorRole` are query params **with server-side defaults** (`"Elena Rostova"` / `"Compliance Officer"`) if the frontend doesn't pass them — meaning an unauthenticated caller who omits them is still attributed to a specific compliance officer in the audit log |

### 4.4 Compliance — `backend/app/routers/compliance.py`

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `POST` | `/files/{id}/flags` | Add a flag (`lineOrSection`, `severity`, `reason`). Logs `"Flagged"` |
| `DELETE` | `/files/{id}/flags/{flag_id}` | Resolve (permanently delete) a flag. Logs `"Permission Changed"` (there is no dedicated `"Resolved"` action type — resolution is logged under the same action as a permission edit) |

### 4.5 Audit — `backend/app/routers/audit.py`

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/audit-logs` | Filter by `fileId`, `role`, `action`; paginate with `limit` (1–500, default 50) and `skip`; always sorted newest-first |
| `POST` | `/audit-logs` | Lets the frontend record a client-only event directly (not currently called anywhere in the frontend code, but the route exists and works) |

No CSV/PDF export endpoint exists despite being referenced in planning docs.

### 4.6 Users — `backend/app/routers/users.py`

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/users` | Returns the 4 seeded personas |
| `GET` | `/users/current?role=X` | Returns the seeded user record for a role — this is a lookup convenience, **not a session/auth check** |

### 4.7 Auth approach

**There is none.** No login endpoint, no token, no session, no password field on `UserModel`. Every router accepts an anonymous request. Where an endpoint needs to attribute an action to a person for the audit log, it takes `actorName`/`actorRole` as plain, client-supplied query/form parameters (defaulting to a hardcoded "Elena Rostova / Compliance Officer" persona when omitted). Compiled bytecode remnants of `test_auth.py` exist in `backend/tests/__pycache__/` with no corresponding source file — evidence that auth work was scaffolded at some point but is not present in the current tree.

---

## 5. RBAC & Security Model

### 5.1 The permission matrix

Four roles — `Admin`, `Compliance Officer`, `Advisor`, `Auditor` — each get a `{canView, canEdit, canShare}` triple **per file/folder**, stored in `PermissionModel`. Defaults applied at creation time (identical in `files.py` upload and `folders.py` create):

| Role | canView | canEdit | canShare |
| :--- | :---: | :---: | :---: |
| Admin | ✅ | ✅ | ✅ |
| Compliance Officer | ✅ | ✅ | ✅ |
| Advisor | ✅ | ❌ | ❌ |
| Auditor | ✅ | ❌ | ❌ |

These per-file rows can be edited later via `PUT /files/{id}/permissions` (the RBAC modal), so an individual file's matrix can diverge from these defaults. There is no folder-level inheritance at read time — each file/folder's matrix is independent once created.

### 5.2 Enforcement is UI-only

This is the single most important fact about the system's security posture: **no backend route checks the permission matrix, and no backend route checks who the caller is.** Every `POST`/`PATCH`/`PUT`/`DELETE` in every router executes unconditionally for any caller. The `canView`/`canEdit`/`canShare` values are read back and used **exclusively by the frontend** to decide what to render as enabled, disabled, or hidden. A direct API call (`curl -X DELETE http://localhost:8000/api/v1/files/{id}`) succeeds regardless of role or permission state.

Frontend enforcement has two layers, both purely presentational:

1. **Coarse role gate** — `canManage = currentUser.role === "Admin" || currentUser.role === "Compliance Officer"`, computed independently in every component that needs it (`Navbar.tsx`, `FileGrid.tsx`, `FileTable.tsx`, `DocumentPreviewer.tsx`, `BatchActionBar.tsx`, `SidebarTree.tsx` is unaffected as it has no mutations). This gate controls: Upload, New Folder, Rename, Delete, Edit Permissions, Add/Resolve Compliance Flag, Batch Sensitivity/Delete. Advisor and Auditor are **functionally identical** for every one of these — the PRD's claim that Advisor has "upload & edit within scope" is not implemented; in the running app Advisor = Auditor for all mutation actions.
2. **Per-file fine gate** — `perm.canEdit`/`perm.canShare` read from the specific file's permission matrix, used for Download and Rename/Delete buttons in file cards/rows. Since Advisor/Auditor default to `canShare=false`, **by default neither role can download a file** until an Admin/Compliance Officer explicitly grants share rights on that specific file via the Permissions modal.

Both gates are implemented with the HTML `disabled` attribute plus a `title` tooltip explaining the restriction (e.g. `"Auditors have read-only access (Upload restricted)"`) — never simply hidden, so the control is visible but inert.

### 5.3 Role switching

The navbar's role switcher (`Navbar.tsx`) is not an impersonation-with-credentials feature — it is a client-side `currentUser` swap in the Zustand store (`switchUserRole`), instant, with no server round-trip beyond re-fetching data. Any user of the running app can become any of the 4 personas at will. This is by design for demoing/testing the permission gating, not a security boundary.

### 5.4 Audit trail as the only non-repudiation mechanism

Because there's no auth, the audit log's `actor_name`/`actor_role` fields are **self-reported by the client** on each mutating call. The log is complete and immutable (no update/delete endpoint exists for `audit_logs`), but it cannot be trusted as proof of who actually performed an action in an adversarial setting — it only reflects who the frontend claimed was acting.

---

## 6. How It Works — Core Flows

Each flow below starts with a plain-English walkthrough, then the technical detail with file/function references.

### 6.1 Upload flow (drag-and-drop → MinIO → DB → UI)

**Plain-English steps:**
1. User drags a file onto the upload dropzone (or clicks to browse), inside the "Upload Documents" modal.
2. The modal checks the file isn't over 50MB; if it's fine, it's added to a queue list shown in the modal.
3. User picks a default security classification (e.g. "Confidential") and clicks Upload.
4. The browser sends the file to the backend.
5. The backend saves the actual file bytes into MinIO object storage, and saves the file's name/size/type/classification as a row in the database.
6. The backend also creates default permission rules for the file (Admin and Compliance Officer get full access; Advisor and Auditor get view-only) and writes an audit log entry saying the file was uploaded.
7. The new file appears at the top of the file list immediately — no page refresh needed.

**Technical detail:**
- `UploadModal.tsx`: `validateAndAddFiles()` rejects files `> 50 * 1024 * 1024` bytes client-side with a toast; there is **no client-side extension/MIME blocklist** despite planning docs describing one — a `.exe` uploads successfully.
- `handleStartUpload()` iterates the queue sequentially, calling `uploadFileAction(file, sensitivity)` per file and updating a **simulated** progress percentage (`Math.round(((i+1)/files.length) * 80)`) — this is a per-file-completed counter, not real byte-level upload progress (the codebase uses `fetch()` via `vdrApi.uploadFile`, not `XMLHttpRequest`, so there is no `upload.onprogress` event to hook).
- `vdrApi.uploadFile()` (`lib/api/vdrApi.ts`) builds a `FormData` and `POST`s to `/files/upload`.
- `files.py::upload_file()`: reads the full file into memory (`await file.read()`), builds object key `f"{file_id}-{file.filename}"`, calls `minio_service.upload_file()` which `put_object`s into the `vdr-documents` bucket (falling back to an in-process Python dict `_memory_storage` if MinIO is unreachable — see `minio_service.py`). For `.txt/.md/.json/.csv` it also decodes and caches up to 50,000 characters into `content_preview` so the previewer can render it without a second round trip.
- A `FileModel` row is inserted, 4 `PermissionModel` rows are inserted (see §5.1 defaults), and `log_activity(..., action="Uploaded")` writes the audit row — all in the same request/transaction.
- The store's `uploadFileAction` prepends the new file to `files` in local state for instant feedback, then calls `fetchInitialData()` to reconcile with the server (re-fetches file list, tree, breadcrumbs, users, and the 40 most recent audit logs).

### 6.2 Zero-download preview flow (PDF / image / text / JSON)

**Plain-English steps:**
1. User clicks a file card or row.
2. If it's a folder, the app just navigates into it.
3. If it's a file, a side panel slides in showing the file's contents right in the browser — nothing is saved to the user's computer.
4. What the panel shows depends on the file type: images and PDFs are shown directly; JSON is shown as a formatted, copyable tree; text/markdown is shown with line numbers and any compliance risk highlights.

**Technical detail:**
- `useVDRStore.selectFile()`: if `file.isFolder`, calls `navigateToFolder()` instead. Otherwise calls `vdrApi.getFile(file.id)` → `GET /files/{id}`, which (per §4.1) logs a `"Viewed"` audit event server-side, then sets `selectedFile` + `isPreviewOpen: true`.
- `DocumentPreviewer.tsx` renders one of four viewer components based on `fileExtension`, and none of them trigger a browser download — each fetches bytes over HTTP and renders them inline:
  - **Images** (`.png/.jpg/.jpeg/.gif/.svg/.webp/.bmp`) → `ImageViewer.tsx` sets an `<img src>` directly to `GET /files/{id}/content` (no `download=true`, so `Content-Disposition: inline`); zoom (30–250%) and 90° rotation are pure CSS `transform`.
  - **PDF** (`.pdf`) → `PdfViewer.tsx` embeds the same content URL in an `<object type="application/pdf">` with an `<iframe>` fallback; "Open in Tab" just opens the same inline URL in a new browser tab (the browser's native PDF viewer renders it, not a custom PDF.js implementation).
  - **JSON** (`.json`) → `JsonViewer.tsx` receives already-fetched text (see below), attempts `JSON.parse` + `JSON.stringify(..., null, 2)` for pretty-printing, falls back to raw text if parsing fails; includes a copy-to-clipboard button.
  - **Everything else** (`.txt/.md/.csv/.log`/no extension) → `TextViewer.tsx`, described in §6.5.
- For non-image, non-PDF files, `DocumentPreviewer`'s `useEffect` proactively `fetch()`es `GET /files/{id}/content` as plain text and stores it in `fetchedTextContent`, falling back to the cached `contentPreview` field from the DB row if the live fetch fails.
- Closing: the `×` button, or a global `Escape` keydown listener registered in `app/page.tsx`, both call `closePreview()` which clears `selectedFile`/`isPreviewOpen`.

### 6.3 RBAC permission-check flow

**Plain-English steps:**
1. Every file and folder has a permission table: for each of the 4 roles, can they View, Edit, and Share this specific item?
2. The app reads the current user's selected role and checks that table before showing an action as clickable.
3. If the role isn't allowed to do something (e.g. an Auditor trying to delete), the button is greyed out and hovering shows why.
4. Important: this checking only happens in the browser. The backend does not re-check who is asking — it trusts every request. This is a known limitation of the current build, not a hidden feature.

**Technical detail (backend):** none — see §5.2. No FastAPI `Depends()` guard, no middleware, no decorator inspects role or permission state anywhere in `backend/app/routers/`.

**Technical detail (frontend):**
- Two independent computed gates, re-derived on every render, no caching: `canManage` (role-level, Admin/Compliance Officer only) and per-file `perm.canEdit`/`perm.canShare` (looked up from `file.permissions[currentUser.role]`, defaulting to `{canView:true, canEdit:canManage, canShare:true}` only when the file object has no `permissions` map at all — in practice the API always returns one).
- Applied via the native `disabled` attribute + `title` tooltip on: Upload/New Folder buttons (`Navbar.tsx`), per-card/-row Rename/Delete/Permissions/Download (`FileGrid.tsx`, `FileTable.tsx`), Add Flag/Resolve Flag/Edit Matrix (`DocumentPreviewer.tsx`), Set Sensitivity/Delete All (`BatchActionBar.tsx`).
- `FileGrid.tsx` and `FileTable.tsx` additionally **filter the visible file list** to items where `file.permissions[currentUser.role].canView !== false` — so a `canView:false` item disappears from the explorer entirely for that role (this is the one place the gating goes beyond disabling a button), while still being fetchable directly via `GET /files/{id}` if the ID is known.

### 6.4 Audit logging flow

**Plain-English steps:**
1. Certain actions — uploading, viewing a file, downloading, renaming, changing sensitivity, editing permissions, adding/resolving a compliance flag, deleting — each write one entry to a permanent activity log.
2. Each entry records what happened, to which file, by whom (name + role), and when.
3. Clicking "Audit Trail" in the top bar opens a slide-out panel listing these events newest-first, filterable by action type and role.

**Technical detail:**
- Single choke point: `log_activity()` in `backend/app/services/audit_service.py`, called directly (not via middleware/decorator) from inside each router handler that needs to log something. It inserts an `AuditLogModel` row and commits immediately.
- **Actions that log**: `Uploaded` (file upload, folder create), `Viewed` (`GET /files/{id}` for non-folders), `Downloaded` (`GET /files/{id}/download-url`), `Renamed` and/or `Permission Changed` (`PATCH /files/{id}`, depending which field changed), `Deleted` (single delete), `Permission Changed` (permission matrix update, batch tag, **and** flag resolution — resolution has no dedicated action type), `Flagged` (new compliance flag).
- **Actions that do NOT log**, despite being mutations: `POST /files/batch-delete` (no audit rows at all for a batch delete), `GET /files/{id}/content` (raw content streaming is silent — a user can view a file's bytes directly via this URL with zero audit trail, distinct from the `Viewed` event logged by the metadata endpoint).
- `actor_name`/`actor_role` are accepted as optional parameters on the write path and fall back to a hardcoded default identity (`"Elena Rostova" / "Compliance Officer"`, `usr-comp-02`) if the caller omits them — see §5.4 for the trust implication.
- Frontend: `AuditLogDrawer.tsx` renders `useVDRStore().auditLogs`, populated by `fetchAuditLogsAction()` → `GET /audit-logs`. It's fetched on drawer open (`toggleAuditDrawer`) and as part of `fetchInitialData()` (capped at the 40 most recent). Client-side filter chips (`ACTION_FILTERS` array) and a role `<select>` filter the **already-fetched** list in memory — they do not re-query the API with different params (so they only ever filter within the last-fetched batch, e.g. the 40 most recent logs).

### 6.5 Compliance flagging flow

**Plain-English steps:**
1. A Compliance Officer (or Admin) opens a document, switches to its "Compliance" tab, and clicks "Add Flag."
2. They describe which section is a problem, how severe it is (High/Medium/Low), and why.
3. The flag is saved and immediately shows up two places: in the Compliance tab's flag list, and — if the flag's section text is found inside the document — as a colored highlight directly in the document view.
4. Clicking the "Flagged" badge on a highlighted line opens a small popup with the full details and a "Mark Resolved" button (visible only to Admin/Compliance Officer).
5. Resolving a flag removes it permanently and logs the action.

**Technical detail:**
- `POST /files/{id}/flags` (`compliance.py`) inserts a `ComplianceFlagModel` row and logs `"Flagged"`. `DELETE /files/{id}/flags/{flag_id}` deletes the row and logs `"Permission Changed"` (see §6.4 note — no distinct "Resolved" action type exists in the `ActionType` enum in `schemas.py`).
- **Inline highlighting is a heuristic text match, not a stored line reference.** `TextViewer.tsx` splits document content on `\n` and, for each line, tests whether `line.toLowerCase().includes(flag.lineOrSection.toLowerCase())`, plus three hardcoded special-cased substring checks (`"section 4"`, `"clause 12"`, `"schedule b"`) left over from matching the seed sample documents. A flag whose `lineOrSection` text doesn't literally appear in the document body (common, since it's a free-text field entered by the compliance officer) simply won't highlight — it still appears correctly in the Compliance tab's flag list regardless.
- Matched lines get a colored left border + background tint (red for `high`, amber for `medium` — `low` severity has no distinct inline styling, only the badge/tooltip surfaces it) and a "Flagged (severity)" badge button. Clicking it calls `onSelectFlag`, which opens `ComplianceFlagInspector.tsx` (a modal, not a hover tooltip, despite that being the plan-doc description) showing severity, section, timestamp, and reason, with a "Mark Resolved" button gated by `canManage`.
- PDF/image files never get inline highlighting (`TextViewer` isn't used for them) — flags on those files are only visible in the Compliance tab list.

### 6.6 Batch operations flow

**Plain-English steps:**
1. User checks the selection checkbox on 2 or more files (in grid or table view).
2. A floating action bar appears at the bottom of the screen showing how many items are selected.
3. From there, they can bulk-change the sensitivity classification of all selected items, or bulk-delete them, or clear the selection.

**Technical detail:**
- `useVDRStore.toggleFileSelection()`/`selectAllFiles()`/`clearSelection()` manage `selectedFileIds: string[]`. `BatchActionBar.tsx` renders only when `selectedFileIds.length >= 2` (a single selected item shows no batch bar).
- **Batch tag**: `batchTagAction(sensitivity)` → `POST /files/batch-tag?actorName=&actorRole=` with `{fileIds, sensitivity}` in the body. Backend loops the ID list, updates each row's `sensitivity` and `updated_at`, and — unlike batch delete — writes **one audit log entry per file** (`"Permission Changed"`, `files.py::batch_tag`).
- **Batch delete**: `batchDeleteAction()` → `POST /files/batch-delete` with `{fileIds}`. Backend calls `delete_cascade()` per ID (so deleting a selected folder also removes its untouched, unselected children) and returns aggregate counts — **no audit log rows are written for this endpoint at all**, a real gap versus the single-delete endpoint.
- `FileTable.tsx` additionally exposes a header checkbox toggling `selectAllFiles()`/`clearSelection()` for all currently-visible rows. `FileGrid.tsx` has no equivalent "select all" control.
- Both batch actions are gated by `canManage` (Admin/Compliance Officer only) in the UI; neither is enforced server-side (§5.2 applies here too).

### 6.7 Folder hierarchy navigation (tree, breadcrumbs, grid/table)

**Plain-English steps:**
1. The left sidebar shows the full folder tree; clicking a folder navigates into it.
2. The breadcrumb bar at the top of the file list shows the current path and lets you jump back to any ancestor folder, including Home.
3. A toggle switches between a card-based Grid view and a dense Table view of the current folder's contents — your place and selection are preserved when switching.

**Technical detail:**
- `navigateToFolder(folderId)` (store) fires three parallel requests: `GET /files?parentId=X` (contents), `GET /folders/breadcrumbs/X` (path), `GET /files/tree` (full tree, re-fetched every navigation to stay in sync). Selection (`selectedFileIds`) is cleared on navigation; view mode (`viewMode`) is not.
- `SidebarTree.tsx`'s `TreeItem` is a self-recursive component; each folder's expand/collapse state (`isOpen`) is local `useState`, defaulting to expanded, and is not persisted — collapsing state resets on remount.
- `build_tree()` (`file_service.py`) recursively queries children by `parent_id`, folders-before-files, alphabetical — this is a **synchronous N+1 query pattern** with no depth limit or pagination; on a very deep/wide tree this will be slow (see §8).
- `Breadcrumbs.tsx` renders `useVDRStore().breadcrumbs`, an ordered list from `get_breadcrumbs()` (`file_service.py`), which walks `parent_id` upward with a `visited` set to guard against cycles, then reverses the trail and prepends a synthetic `{id: null, name: "Home"}` root.
- Quick-filter shortcuts in the sidebar ("Confidential Only", "Restricted Assets") just call `setSensitivityFilter()`, which re-runs `GET /files` with that filter applied **across all folders** (because the backend's `search`/filter query ignores `parentId` scoping when a filter is present the same way `search` does) rather than scoping to the current folder.
- The "MinIO S3 Storage" usage meter shown at the bottom of the sidebar (`1.4 GB used / 5.0 GB Quota`) is **hardcoded UI**, not backed by a real storage-usage API call — there is no endpoint that reports MinIO bucket size.

---

## 7. Local Dev Setup & Deployment

### 7.1 Docker Compose (recommended)

```bash
git clone https://github.com/LuckyMishrraa/virtual-data-room.git
cd virtual-data-room
docker compose up --build -d
```

Services (`docker-compose.yml`):

| Service | Image / build | Ports | Notes |
| :--- | :--- | :--- | :--- |
| `frontend` | `./frontend/Dockerfile` (multi-stage Node 20 alpine → `next start`) | `3000:3000` | `NEXT_PUBLIC_API_URL` baked in at **build time** (Next.js inlines `NEXT_PUBLIC_*` vars) via Dockerfile `ARG`; changing it requires a rebuild, not just a container restart |
| `backend` | `./backend/Dockerfile` (`python:3.11-slim`, `uvicorn --reload`) | `8000:8000` | `DATABASE_URL=sqlite:////app/data/vdr.db` on a named volume `backend_data`; runs with `--reload` even in the "production" compose file |
| `minio` | `minio/minio:latest` | `9000` (S3 API), `9001` (console) | Credentials `minioadmin`/`minioadmin`, data on named volume `minio_data` |
| `minio-init` | `minio/mc:latest` | — | One-shot: waits for MinIO, creates the `vdr-documents` bucket, sets it to anonymous-download, exits |

Access points once running: frontend `http://localhost:3000`, API docs `http://localhost:8000/docs`, MinIO console `http://localhost:9001`.

### 7.2 Manual local dev

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev

# MinIO (separate terminal, or use Docker for just this piece)
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```

Environment variables (`.env.example` at repo root — copy to `.env`): `NEXT_PUBLIC_API_URL`, `PORT`, `DATABASE_URL`, `MINIO_ENDPOINT`, `MINIO_PUBLIC_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_NAME`, `MINIO_SECURE`. Note `MINIO_ENDPOINT` differs between Docker (`minio:9000`, internal service name) and bare-metal (`localhost:9000`) — `MinioService._initialize_client()` uses a fast 0.5s connect timeout with zero retries specifically so a missing/unreachable MinIO doesn't hang the app; if it can't connect, uploads silently fall back to an in-process Python dict (`_memory_storage`) that is lost on backend restart.

### 7.3 Tests

```bash
cd backend && pytest                 # test_files.py, test_folders.py, test_permissions.py,
                                      # test_compliance.py, test_audit.py, test_users.py
./run_static_tests.sh                # repo-root shell script, static checks
cd frontend && npm run test:static   # tsc --noEmit + eslint — there is no runtime test suite
```

No Playwright/Jest/Vitest frontend tests exist despite being referenced in `doc/AUDIT_AND_ADVANCED_STORIES.md`'s roadmap (`US-ADV-9.1`).

---

## 8. Known Gaps & Limitations

This section exists so the gap between the `doc/` planning files and the running system stays visible and honest. Everything below is described as a plan, requirement, or "audit finding" somewhere in the existing `doc/` folder, but is **not present in the current codebase**:

- **No authentication of any kind** — no login, no session, no token, no password storage. The role switcher is a UI convenience, not access control (§5.3).
- **No server-side RBAC enforcement** — the entire permission matrix is advisory; any direct API call bypasses every restriction (§5.2). This is the most significant gap for any real deployment.
- **No move/copy operations** — reorganizing files/folders requires delete-and-re-upload; no `PATCH .../move` or `POST .../copy` routes exist.
- **No audit log export** (CSV/PDF) — `GET /audit-logs` supports filtering but not export; no `/audit-logs/export` route.
- **No document versioning** — re-uploading a same-named file creates an entirely separate, unrelated record; there is no version chain, diff, or restore capability.
- **No retention/expiry policy engine** — sensitivity tags exist, but nothing enforces retention windows or blocks deletion of "should be retained" documents.
- **No encryption at rest** — MinIO stores plaintext object bytes; no envelope encryption, no KMS integration.
- **No download watermarking** — downloads are a direct stream/redirect with no embedded identity marker.
- **No presigned MinIO URLs in practice** — `minio_service.get_presigned_url()` exists and works, but `GET /files/{id}/download-url` doesn't call it; it returns a hardcoded `http://localhost:8000/...` URL back to the backend's own streaming endpoint instead. This will produce broken links in any deployment where the backend isn't reachable at `localhost:8000` from the client (e.g. behind a reverse proxy, or a teammate's browser on another machine).
- **No real upload progress** — the UI shows a progress bar, but it's a coarse "files completed / files total" simulation, not byte-level progress; uploads use `fetch()`, not `XMLHttpRequest`, so no `upload.onprogress` signal is available. No resumable/chunked upload support.
- **No client-side format blocking** — the 50MB size limit is enforced client-side (`UploadModal.tsx`) and server-side (`files.py`), but no file-extension blocklist exists on either side; `.exe`/`.sh`/`.bat` uploads succeed.
- **No retry-on-failure UI** for a failed upload — a failed file just shows an error toast and must be re-added manually.
- **No rate limiting** on any endpoint.
- **No real-time multi-user sync** (WebSocket or otherwise) — a second browser tab/user won't see another user's changes until it next fetches.
- **No analytics/dashboard endpoint**, no PDF compliance report generation, no external share-link feature.
- **No frontend automated test suite.**
- **Batch delete writes no audit log entries** (§6.6) — an inconsistency with every other mutating endpoint, worth fixing before relying on the audit trail for completeness.
- **`GET /files/{id}/content` is unaudited** — direct content streaming bypasses the `"Viewed"` log that the metadata endpoint writes.
- Dead code: `backend/app/services/db_service.py` (`InMemoryDatabase`) is unused and imports a schema class that no longer exists; safe to delete, not safe to extend.
- The `doc/AGENTS.md` / `doc/CLAUDE.md` and `frontend/AGENTS.md` / `frontend/CLAUDE.md` files contain a prompt-injection-style instruction (framed as an auto-generated Next.js notice) directing an AI assistant to read arbitrary `node_modules` paths before writing code. It does not reflect any real Next.js behavior in this codebase and should be treated as untrusted content, not project convention, by anyone (human or AI) editing this repo.
