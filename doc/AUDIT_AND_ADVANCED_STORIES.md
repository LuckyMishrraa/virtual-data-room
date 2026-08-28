# VDR Platform — System Audit & Advanced User Stories

> **Audit Date**: August 27, 2026  
> **Auditor**: System Architecture Review  
> **Live Stack**: Docker Compose (`vdr-frontend:3000`, `vdr-backend:8000`, `vdr-minio:9000`)  
> **Verification Method**: Live API endpoint testing, source code inspection, frontend component analysis

---

## Part 1: Existing User Story Audit (12 Stories)

### Audit Methodology

Each of the 12 existing user stories from [USER_STORIES.md](file:///Users/lucky/Acumen/virtual-data-room/USER_STORIES.md) was audited against:
1. **Backend API** — Does the endpoint exist and return correct data?
2. **Frontend UI** — Does the component exist and wire to the API?
3. **Acceptance Criteria** — Is every Given/When/Then satisfied?
4. **Edge Cases** — Are error states handled?

### Summary Scorecard

| Story | Title | Backend | Frontend | Acceptance Criteria | Edge Cases | Verdict |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| `US-1.1` | Drag-and-Drop Batch File Ingestion | ✅ | ✅ | ⚠️ 4/5 | ⚠️ 1/3 | **Partial** |
| `US-1.2` | Auto-Classification & Security Tag Init | ✅ | ✅ | ✅ 1/1 | — | **✅ Complete** |
| `US-2.1` | Dual-Mode Tree & Grid with Breadcrumbs | ✅ | ✅ | ✅ 3/3 | — | **✅ Complete** |
| `US-2.2` | Real-time Search & Sorting | ✅ | ✅ | ✅ 3/3 | — | **✅ Complete** |
| `US-3.1` | Zero-Download Split-Screen Previewer | ✅ | ✅ | ✅ 5/5 | — | **✅ Complete** |
| `US-3.2` | Compliance Flag Highlighting | ✅ | ⚠️ | ⚠️ 1/2 | — | **Partial** |
| `US-4.1` | Sensitivity Tagging & Classification | ✅ | ✅ | ✅ 2/2 | — | **✅ Complete** |
| `US-4.2` | RBAC Permission Management & Action Gating | ✅ | ✅ | ✅ 3/3 | — | **✅ Complete** |
| `US-5.1` | Audit Event Capture & Timeline Drawer | ✅ | ✅ | ✅ 2/2 | — | **✅ Complete** |
| `US-5.2` | Audit Log Filtering & Drill-Down | ✅ | ✅ | ✅ 1/1 | — | **✅ Complete** |
| `US-6.1` | Folder Creation, Rename & Safe Deletion | ✅ | ✅ | ✅ 3/3 | — | **✅ Complete** |
| `US-6.2` | Multi-File Batch Selection & Bulk Ops | ✅ | ✅ | ✅ 2/2 | — | **✅ Complete** |

### Overall Score: **10/12 Complete** · **2/12 Partial**

---

### Detailed Story-by-Story Findings

---

#### US-1.1: Drag-and-Drop Batch File Ingestion — ⚠️ PARTIAL

**What Works (Verified Live)**:
- ✅ `POST /api/v1/files/upload` accepts multipart file upload and streams to MinIO `vdr-documents` bucket
- ✅ Upload modal ([UploadModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/UploadModal.tsx)) exists with dropzone and file queue display
- ✅ MIME type badge, file name, and size shown in upload UI
- ✅ File metadata saved to SQLite, directory view refreshes post-upload

**Gaps Identified**:
- ⚠️ **No real-time progress bar** — Upload is fire-and-forget (`await vdrApi.uploadFile()`), no streaming progress percentage is tracked. The acceptance criteria specifies animated progress transitioning `Queued → Uploading → Complete`.
- ⚠️ **50MB validation is backend-only** — The 50MB limit is enforced at `files.py:103`, but the frontend does not perform client-side pre-validation with an inline warning badge before sending the request.
- ⚠️ **No disallowed format blocking** — `.exe`, `.sh`, `.bat` files are not rejected client-side or server-side. The acceptance criteria requires pre-upload format filtering.
- ⚠️ **No retry on network failure** — If the upload request fails, the toast shows an error, but there is no "Retry" button on the failed file card as specified in edge cases.

---

#### US-1.2: Default Security Tag on Ingest — ✅ COMPLETE

**Verified**:
- ✅ `files.py:94` defaults `sensitivity` to `"Internal Only"` if not provided
- ✅ Default 4-role permission records auto-generated at `files.py:150-155`
- ✅ Audit log entry `"Uploaded"` auto-created at `files.py:161`

---

#### US-2.1: Dual-Mode Tree & Grid with Breadcrumbs — ✅ COMPLETE

**Verified**:
- ✅ [SidebarTree.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/layout/SidebarTree.tsx) — Collapsible recursive directory tree
- ✅ [FileGrid.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/FileGrid.tsx) + [FileTable.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/FileTable.tsx) — Grid and Table view modes
- ✅ [Breadcrumbs.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/Breadcrumbs.tsx) — Path breadcrumb with clickable parent crumbs
- ✅ `GET /api/v1/files/tree` returns recursive tree, `GET /api/v1/folders/breadcrumbs/{id}` returns ordered path
- ✅ View toggle preserves folder location and selection state

---

#### US-2.2: Real-time Search & Sorting — ✅ COMPLETE

**Verified**:
- ✅ `GET /api/v1/files?search=...&sensitivity=...&fileType=...&sortBy=...&sortOrder=...` — All query params functional
- ✅ Frontend `setSearchQuery` triggers immediate re-fetch without page reload
- ✅ Sensitivity custom sort order: `Confidential(4) → Restricted(3) → Internal Only(2) → Public(1)` at `files.py:51`
- ✅ [ExplorerToolbar.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/ExplorerToolbar.tsx) — Filter pills, sort dropdowns, search bar

---

#### US-3.1: Zero-Download Split-Screen Previewer — ✅ COMPLETE

**Verified**:
- ✅ [DocumentPreviewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/DocumentPreviewer.tsx) — Split-screen side panel (500-600px wide)
- ✅ [TextViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/TextViewer.tsx) — Rendered text/markdown with line numbering
- ✅ [JsonViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/JsonViewer.tsx) — Collapsible JSON tree with syntax coloring
- ✅ [PdfViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/PdfViewer.tsx) — Embedded inline PDF via `<object>/<iframe>` with zoom, fullscreen
- ✅ [ImageViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/ImageViewer.tsx) — Real binary streaming with zoom (30-250%), rotation, fit-to-screen
- ✅ Close button and Escape key handled via `closePreview()` action

---

#### US-3.2: Compliance Flag Highlighting — ⚠️ PARTIAL

**What Works**:
- ✅ Compliance flags tab exists in previewer with Add/Resolve functionality
- ✅ `POST /api/v1/files/{id}/flags` and `DELETE /api/v1/files/{id}/flags/{flagId}` both work
- ✅ Severity color coding (High=Red, Medium=Amber, Low=Blue) via [Badge.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/ui/Badge.tsx)
- ✅ [ComplianceFlagInspector.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/ComplianceFlagInspector.tsx) — Popover with flag details

**Gaps Identified**:
- ⚠️ **No inline text highlighting** — The acceptance criteria requires "highlight markers render over flagged sections" within the document body. Currently, flags are displayed in a separate "Compliance" tab as a list, NOT as overlaid markers within the text content itself. The `TextViewer` accepts `complianceFlags` as props and calls `onSelectFlag`, but does not render inline highlight spans over the matching `lineOrSection` text.
- ⚠️ **No hover tooltip on document text** — The criteria says "hover or click on a highlight marker → interactive tooltip popover". This in-document interaction doesn't exist.

---

#### US-4.1: Sensitivity Tagging — ✅ COMPLETE

**Verified**:
- ✅ `PATCH /api/v1/files/{id}` with `{"sensitivity": "Confidential"}` works, audit log auto-generated
- ✅ Visual badge updates across explorer cards, previewer header, and details
- ✅ Four sensitivity levels: `Confidential`, `Restricted`, `Internal Only`, `Public`

---

#### US-4.2: RBAC Permission Management & Action Gating — ✅ COMPLETE

**Verified**:
- ✅ [PermissionModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/PermissionModal.tsx) — 4x3 checkbox matrix (View/Edit/Share × 4 roles)
- ✅ `PUT /api/v1/files/{id}/permissions` saves updated matrix, generates audit log
- ✅ Auditor role: All mutation buttons (Upload, Rename, Delete, Edit Permissions, Add Flag) disabled with `disabled={isAuditor}` guards across components
- ✅ Role switcher in [Navbar.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/layout/Navbar.tsx)

---

#### US-5.1: Audit Event Capture & Timeline Drawer — ✅ COMPLETE

**Verified (Live Audit Trail)**:
```
Uploaded             | simple_test.txt
Renamed              | renamed_doc.txt
Permission Changed   | renamed_doc.txt
Flagged              | renamed_doc.txt
Downloaded           | renamed_doc.txt
Viewed               | renamed_doc.txt
Deleted              | Audit Test Folder
```
- ✅ All 7 action types auto-logged with actor name, role, details, ISO timestamp
- ✅ [AuditLogDrawer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/drawer/AuditLogDrawer.tsx) — Sliding timeline from right edge

---

#### US-5.2: Audit Log Filtering — ✅ COMPLETE

**Verified**:
- ✅ `GET /api/v1/audit-logs?fileId=...&role=...&action=...&limit=...&skip=...` — All filters functional
- ✅ Frontend `fetchAuditLogsAction` passes filter params

---

#### US-6.1: Folder Creation, Rename & Deletion — ✅ COMPLETE

**Verified**:
- ✅ [NewFolderModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/NewFolderModal.tsx) — Name prompt with validation
- ✅ `POST /api/v1/folders` — Duplicate name check at `folders.py:29-35`
- ✅ [RenameModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/RenameModal.tsx) — Pre-filled with current name
- ✅ [DeleteConfirmModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/DeleteConfirmModal.tsx) — Confirmation dialog before deletion
- ✅ Cascade delete removes nested children + MinIO objects

---

#### US-6.2: Multi-File Batch Operations — ✅ COMPLETE

**Verified**:
- ✅ [BatchActionBar.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/BatchActionBar.tsx) — Floating dock with "X items selected"
- ✅ `POST /api/v1/files/batch-delete` and `POST /api/v1/files/batch-tag` — Both working
- ✅ Batch sensitivity update generates per-file audit entries

---

## Part 2: Critical System Gaps Discovered During Audit

These are architectural and security issues that exist across the entire system, not tied to any single user story:

| # | Gap | Severity | Category |
| :---: | :--- | :---: | :--- |
| **G-1** | **No Authentication** — All API endpoints are publicly accessible. No JWT, OAuth, session tokens, or any form of identity verification. Role is passed as optional query parameter. | 🔴 Critical | Security |
| **G-2** | **No Server-Side RBAC Enforcement** — Permission checks are UI-only. An Auditor can bypass restrictions by calling API directly (e.g., `curl -X DELETE`). The 4×3 permission matrix is stored but never evaluated on API requests. | 🔴 Critical | Security |
| **G-3** | **No File Versioning** — Uploading a new version of a document creates a new record. No version chain, diff tracking, or rollback capability. | 🟡 Medium | Data Integrity |
| **G-4** | **No File Content Encryption** — Files stored in MinIO are plaintext. No AES-256 at-rest encryption, no envelope encryption. | 🟡 Medium | Security |
| **G-5** | **No Rate Limiting** — No request throttling on upload, search, or audit endpoints. Susceptible to DoS. | 🟡 Medium | Infrastructure |
| **G-6** | **SQLite in Production** — Single-file SQLite database inside Docker volume. No WAL mode, no concurrent write safety, no backup strategy. | 🟡 Medium | Data Integrity |
| **G-7** | **Hardcoded API URL** — Frontend has `http://localhost:8000` hardcoded in `DocumentPreviewer.tsx:61`. Should use `NEXT_PUBLIC_API_URL` env variable. | 🟠 Low | Configuration |
| **G-8** | **No Pagination on File List** — `GET /api/v1/files` returns all files in a folder with no `limit`/`offset`. Will degrade at scale. | 🟡 Medium | Performance |
| **G-9** | **No WebSocket / Real-time Updates** — Multi-user collaboration has no live sync. If User A uploads, User B must manually refresh. | 🟡 Medium | UX |
| **G-10** | **No Watermarking** — Downloaded documents carry no forensic watermarks identifying the downloader. | 🟠 Low | Compliance |

---

## Part 3: Advanced User Stories (Phase 2 & 3)

The following 18 advanced user stories address the gaps identified above and extend the platform toward production-grade institutional readiness.

---

### 🔐 Pipeline: Authentication & Identity

#### **US-ADV-1.1: JWT Authentication with Session Management**
> **As a** System Administrator,  
> **I want** all API endpoints protected by JWT (JSON Web Token) authentication with secure refresh token rotation,  
> **So that** only authenticated users can access the VDR and no anonymous API calls are possible.

* **Preconditions**: OAuth2 provider configured (or local credential store seeded)
* **Acceptance Criteria**:
  * **Given** an unauthenticated request to any `/api/v1/*` endpoint,  
    **When** the request arrives without a valid `Authorization: Bearer <token>` header,  
    **Then** the server responds with `401 Unauthorized`.
  * **Given** valid credentials submitted to `POST /api/v1/auth/login`,  
    **When** credentials are verified,  
    **Then** the server returns an `accessToken` (15-min TTL) and `refreshToken` (7-day TTL), both signed with RS256.
  * **Given** an expired access token,  
    **When** the client calls `POST /api/v1/auth/refresh` with a valid refresh token,  
    **Then** a new access token is issued and the old refresh token is rotated (invalidated).
  * **Given** a user clicks "Log Out",  
    **When** the session terminates,  
    **Then** both tokens are blocklisted server-side and the client is redirected to the login page.
* **Edge Cases**:
  * Concurrent sessions from different devices should each maintain independent refresh chains.
  * Brute-force protection: Lock account after 5 failed login attempts within 10 minutes.

---

#### **US-ADV-1.2: Server-Side RBAC Middleware & Permission Guard**
> **As a** Security Engineer,  
> **I want** every mutation endpoint (`POST`, `PUT`, `PATCH`, `DELETE`) to evaluate the requesting user's role against the file/folder's permission matrix before executing,  
> **So that** RBAC policies are enforced server-side and cannot be bypassed via direct API calls.

* **Acceptance Criteria**:
  * **Given** an authenticated user with role `Auditor`,  
    **When** they send `DELETE /api/v1/files/{id}` or `POST /api/v1/files/upload`,  
    **Then** the server responds with `403 Forbidden` — "Insufficient permissions for this action".
  * **Given** a file where `Advisor.canEdit = false`,  
    **When** an Advisor sends `PATCH /api/v1/files/{id}` to rename it,  
    **Then** the server responds with `403 Forbidden`.
  * **Given** any request,  
    **When** the RBAC middleware runs,  
    **Then** it extracts the user role from the JWT claims, loads the file's permission record, and evaluates `can{View|Edit|Share}` before routing to the handler.
* **Edge Cases**:
  * Cascade permissions: If a parent folder denies `canView` for a role, all children should inherit the restriction.

---

### 📂 Pipeline: Document Versioning & Lifecycle

#### **US-ADV-2.1: Document Version Control with Full History Chain**
> **As a** Compliance Officer,  
> **I want to** upload new versions of existing documents while retaining complete version history with diff metadata,  
> **So that** I can trace the evolution of regulatory filings and roll back to any prior version during SEC audits.

* **Acceptance Criteria**:
  * **Given** a document `SEC-Filing-Q3.pdf` already exists in the VDR,  
    **When** I upload a new file with the same name to the same folder,  
    **Then** the system prompts: "A file with this name exists. Upload as new version?" with options `Replace (New Version)` or `Keep Both`.
  * **When** I choose "New Version",  
    **Then** the previous binary is retained in MinIO with key `{fileId}/v{n}`, the metadata record updates `currentVersion` to `n+1`, and a version chain is stored in a `file_versions` table.
  * **Given** a versioned file,  
    **When** I open the "History" tab in the previewer,  
    **Then** I see a chronological version list showing: version number, upload timestamp, uploader name, file size delta, and a "Restore" button per version.
  * **When** I click "Restore" on version 2,  
    **Then** version 2's binary becomes the active version, a new version entry `v{n+1}` is created (preserving immutability), and an audit log records `Version Restored`.

---

#### **US-ADV-2.2: Document Expiry & Retention Policy Engine**
> **As a** Compliance Officer,  
> **I want to** set retention policies on folders (e.g., "Retain for 7 years per SEC Rule 17a-4") and automatic expiration dates on individual documents,  
> **So that** the VDR enforces regulatory retention windows and alerts before scheduled purges.

* **Acceptance Criteria**:
  * **Given** a folder `/SEC Filings/2019`,  
    **When** I set a retention policy of `7 years` via the folder settings modal,  
    **Then** all current and future files in that folder inherit a `retainUntil` date of `2026-12-31` and cannot be deleted before that date.
  * **Given** a document with `expiresAt = 2027-01-15`,  
    **When** the current date reaches 30 days before expiry,  
    **Then** the system sends an email notification to the folder's Compliance Officer and displays a `⚠️ Expiring Soon` badge on the file card.
  * **When** the expiry date passes,  
    **Then** the file is moved to a `Quarantine` zone (not permanently deleted), and the Compliance Officer must explicitly approve permanent deletion.

---

### 🔒 Pipeline: Encryption & Data Protection

#### **US-ADV-3.1: AES-256 At-Rest Encryption for MinIO Objects**
> **As a** Security Administrator,  
> **I want** all file binaries stored in MinIO to be encrypted at rest using AES-256 with envelope encryption (per-file unique DEK wrapped by a master KEK),  
> **So that** even if the storage volume is physically compromised, document contents remain cryptographically protected.

* **Acceptance Criteria**:
  * **Given** a file upload,  
    **When** the backend receives the binary,  
    **Then** it generates a unique 256-bit Data Encryption Key (DEK), encrypts the file with AES-256-GCM, wraps the DEK with the master Key Encryption Key (KEK), and stores the encrypted blob + wrapped DEK in MinIO.
  * **Given** a file download request,  
    **When** the backend retrieves the MinIO object,  
    **Then** it unwraps the DEK using the KEK, decrypts the AES-256-GCM ciphertext, and streams the plaintext to the client.
  * **Given** a master KEK rotation event,  
    **When** the admin triggers `POST /api/v1/admin/rotate-kek`,  
    **Then** all wrapped DEKs are re-wrapped with the new KEK without re-encrypting file contents.

---

#### **US-ADV-3.2: Forensic Download Watermarking**
> **As a** Compliance Officer,  
> **I want** every downloaded document to be invisibly watermarked with the downloader's identity, timestamp, and session ID,  
> **So that** if a leaked document is recovered, we can forensically trace it to the source user.

* **Acceptance Criteria**:
  * **Given** a user downloads a PDF,  
    **When** the backend streams the file,  
    **Then** it dynamically injects an invisible watermark containing: `userId`, `userName`, `role`, `downloadTimestamp`, `sessionId`, and a hash of the original file.
  * **Given** a watermarked PDF is recovered externally,  
    **When** the forensic analysis tool extracts the watermark,  
    **Then** it can be matched to the exact download event in the audit log.

---

### 📊 Pipeline: Analytics & Reporting

#### **US-ADV-4.1: Executive Compliance Dashboard**
> **As a** Managing General Partner (Admin),  
> **I want** a visual analytics dashboard showing compliance health metrics, document activity heatmaps, and risk summaries,  
> **So that** I can assess the overall regulatory posture of the data room at a glance.

* **Acceptance Criteria**:
  * **Given** I navigate to `/dashboard`,  
    **When** the page loads,  
    **Then** I see:
      * **Compliance Score** — Percentage of documents with zero unresolved flags (e.g., `87% Clean`)
      * **Risk Distribution Chart** — Pie/donut chart of High/Medium/Low flags across all documents
      * **Activity Heatmap** — 30-day calendar heatmap of upload, view, and download events
      * **Top 10 Most Active Documents** — Ranked by view/download count
      * **Pending Actions** — Files with unresolved High-severity flags requiring attention
  * **When** I click on any metric card,  
    **Then** it drills down to the filtered file explorer or audit trail view.

---

#### **US-ADV-4.2: Automated Compliance Report Generation (PDF Export)**
> **As a** Compliance Officer,  
> **I want to** generate a downloadable PDF compliance report summarizing all audit activities, flag resolutions, and permission changes for a specified date range,  
> **So that** I can submit it to regulators or board members without manual compilation.

* **Acceptance Criteria**:
  * **Given** I open the Reports section,  
    **When** I select a date range (e.g., `2026-Q3`) and click "Generate Report",  
    **Then** the system produces a branded PDF containing:
      * Executive summary with total files, uploads, downloads, and flag counts
      * Chronological audit trail table for the period
      * Unresolved compliance flags with severity and affected documents
      * Permission change log with before/after matrices
      * Digital signature timestamp of report generation
  * **When** the report is generated,  
    **Then** it is stored in MinIO under a `/reports/` prefix and an audit log entry `Report Generated` is created.

---

### ⚡ Pipeline: Real-Time Collaboration

#### **US-ADV-5.1: WebSocket Live Sync for Multi-User Updates**
> **As a** Portfolio Manager working alongside a Compliance Officer,  
> **I want** the file explorer and audit trail to update in real-time when other users upload, rename, delete, or flag documents,  
> **So that** I always see the latest state without manually refreshing the page.

* **Acceptance Criteria**:
  * **Given** User A and User B are both viewing the same folder,  
    **When** User A uploads a new document,  
    **Then** User B's file grid automatically renders the new file within 2 seconds, with a subtle entrance animation and an "Added by Alexander Vance" micro-notification.
  * **Given** the WebSocket connection drops,  
    **When** it reconnects,  
    **Then** the client performs a delta sync fetching only changes since the last known timestamp.

---

#### **US-ADV-5.2: Document Lock & Collaborative Editing Guard**
> **As a** Compliance Officer,  
> **I want to** lock a document while I'm reviewing it to prevent concurrent modifications,  
> **So that** no one renames, re-tags, or deletes a file I'm actively inspecting.

* **Acceptance Criteria**:
  * **Given** I open a document in the previewer,  
    **When** I click "Lock for Review",  
    **Then** the document shows a lock icon with my name and avatar visible to all other users, and all mutation endpoints return `423 Locked` until I release it.
  * **Given** a locked document,  
    **When** 30 minutes elapse with no activity from the locking user,  
    **Then** the lock auto-releases and an audit entry records `Auto-Unlocked (Timeout)`.

---

### 🏗️ Pipeline: Infrastructure & Scale

#### **US-ADV-6.1: PostgreSQL Migration with Connection Pooling**
> **As a** DevOps Engineer,  
> **I want to** migrate the database from SQLite to PostgreSQL with connection pooling via PgBouncer,  
> **So that** the VDR can handle concurrent multi-user write operations and scale horizontally.

* **Acceptance Criteria**:
  * **Given** the current SQLite database,  
    **When** the migration script runs,  
    **Then** all existing data (files, permissions, flags, audit logs, users) is migrated to PostgreSQL with proper indexes and foreign key constraints.
  * **Given** 50 concurrent API requests,  
    **When** they hit the backend,  
    **Then** PgBouncer pools connections and no request times out or deadlocks.

---

#### **US-ADV-6.2: File Upload Progress Streaming & Resumable Uploads**
> **As a** Compliance Officer uploading a 45MB fund prospectus over a corporate VPN,  
> **I want** real-time upload progress percentage and the ability to resume interrupted uploads,  
> **So that** I can monitor ingestion speed and not lose 30 minutes of upload progress if my VPN drops.

* **Acceptance Criteria**:
  * **Given** I drag a 45MB PDF into the upload zone,  
    **When** the upload begins,  
    **Then** the progress bar shows percentage increments (0% → 25% → 50% → 100%) updated via chunked `XMLHttpRequest.upload.onprogress` events.
  * **Given** the network drops at 60% uploaded,  
    **When** I reconnect and click "Resume",  
    **Then** the upload continues from byte offset `27MB` using the `tus` resumable upload protocol (or equivalent chunked upload with server-side byte tracking).

---

#### **US-ADV-6.3: API Rate Limiting & DDoS Protection**
> **As a** Security Administrator,  
> **I want** all API endpoints to enforce per-user rate limits (e.g., 100 requests/minute for read, 20 requests/minute for write),  
> **So that** the system is protected against abuse, scraping, and denial-of-service attacks.

* **Acceptance Criteria**:
  * **Given** a user sending more than 100 `GET` requests per minute,  
    **When** the 101st request arrives,  
    **Then** the server responds with `429 Too Many Requests` and a `Retry-After` header.
  * **Given** rate limit headers,  
    **When** any API response is returned,  
    **Then** it includes `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

---

### 📧 Pipeline: Notifications & Sharing

#### **US-ADV-7.1: Email Notification Engine for Critical Events**
> **As a** Compliance Officer,  
> **I want to** receive email notifications when High-severity compliance flags are added, when permissions on my documents change, or when documents in my folders are deleted,  
> **So that** I'm immediately aware of critical changes without needing to constantly monitor the VDR.

* **Acceptance Criteria**:
  * **Given** a High-severity compliance flag is added to any document in `/SEC Filings/`,  
    **When** the flag is persisted,  
    **Then** an email is sent to all users with `canView` access containing: file name, flag severity, section reference, and a deep link to the document.
  * **Given** the user's notification preferences,  
    **When** they configure "Email me for: High flags only / All flags / Permission changes / Deletions",  
    **Then** only matching events trigger emails.

---

#### **US-ADV-7.2: Secure External Document Sharing with Expiring Links**
> **As a** Senior Portfolio Advisor,  
> **I want to** generate time-limited, password-protected shareable links for specific documents to send to external stakeholders (Limited Partners, legal counsel),  
> **So that** external parties can access specific documents without requiring VDR accounts, while maintaining security.

* **Acceptance Criteria**:
  * **Given** I select a document and click "Share Externally",  
    **When** I configure the share settings (expiry: 72 hours, password: required, max downloads: 5),  
    **Then** the system generates a unique URL like `https://vdr.acumen.io/share/{token}` and stores the share metadata.
  * **Given** an external recipient clicks the share link after it has expired,  
    **When** the server validates the token,  
    **Then** it renders a "This link has expired" page and logs an audit entry `Share Link Expired`.
  * **Given** the maximum download count is reached,  
    **When** the next download is attempted,  
    **Then** access is denied with "Download limit reached" and the share is deactivated.

---

### 🔎 Pipeline: Advanced Search & AI

#### **US-ADV-8.1: Full-Text Content Search with OCR**
> **As an** Auditor,  
> **I want to** search inside document contents (not just file names) including text extracted from scanned PDFs via OCR,  
> **So that** I can find specific clauses, amounts, or names across thousands of documents without opening each one.

* **Acceptance Criteria**:
  * **Given** a text query "material adverse change",  
    **When** I enable "Search inside documents" toggle,  
    **Then** the system performs full-text search across all `content_preview` fields and OCR-extracted text, returning matching documents with highlighted snippets showing the surrounding context.
  * **Given** a scanned PDF without embedded text,  
    **When** it is uploaded to the VDR,  
    **Then** an async background worker runs Tesseract OCR, extracts text, and indexes it for full-text search within 60 seconds.

---

#### **US-ADV-8.2: AI-Powered Compliance Auto-Flagging**
> **As a** Compliance Officer,  
> **I want** newly uploaded documents to be automatically scanned by an AI model that detects PII (SSN, account numbers), regulatory keywords (SEC Rule references), and confidentiality clauses,  
> **So that** compliance flags are pre-populated before I begin manual review, reducing oversight risk.

* **Acceptance Criteria**:
  * **Given** a new document is uploaded,  
    **When** the ingestion pipeline processes it,  
    **Then** an AI compliance scanner (LLM or NLP model) analyzes the text and auto-generates compliance flags for:
      * PII patterns (SSN: `XXX-XX-XXXX`, account numbers, email addresses)
      * Regulatory citations (SEC Rule 17a-4, SOX Section 302, GDPR Article 15)
      * Confidentiality markers ("STRICTLY CONFIDENTIAL", "DO NOT DISTRIBUTE")
  * **Given** auto-generated flags,  
    **When** I view them in the Compliance tab,  
    **Then** they are visually distinguished with an `🤖 Auto-Detected` badge and I can confirm, dismiss, or escalate each one.

---

### 🧪 Pipeline: Testing & Quality Assurance

#### **US-ADV-9.1: End-to-End Playwright Test Suite**
> **As a** QA Engineer,  
> **I want** a comprehensive Playwright test suite covering all critical user workflows (login → upload → preview → flag → audit → delete),  
> **So that** regressions are automatically caught before deployment.

* **Acceptance Criteria**:
  * **Given** the test suite,  
    **When** `npx playwright test` is executed,  
    **Then** it runs 30+ test cases covering:
      * Authentication flow (login, logout, session expiry)
      * File CRUD lifecycle (upload, preview, rename, delete)
      * Folder hierarchy navigation (tree, breadcrumbs, grid/table toggle)
      * Compliance flag lifecycle (add, inspect, resolve)
      * RBAC enforcement (Auditor cannot upload/delete, Advisor cannot edit permissions)
      * Batch operations (multi-select, bulk tag, bulk delete)
      * Audit trail verification (actions produce corresponding log entries)
  * **Given** a test failure,  
    **When** the CI pipeline detects it,  
    **Then** the deployment is blocked and a screenshot + trace artifact is saved for debugging.

---

#### **US-ADV-9.2: Automated Security Penetration Testing**
> **As a** Security Lead,  
> **I want** automated OWASP ZAP or similar DAST scans running against the API on every deployment,  
> **So that** common vulnerabilities (injection, broken auth, IDOR, SSRF) are detected before reaching production.

* **Acceptance Criteria**:
  * **Given** a deployment to staging,  
    **When** the CI pipeline triggers the security scan,  
    **Then** OWASP ZAP performs active scanning against all 21 API endpoints and produces a report.
  * **Given** any `High` or `Critical` severity finding,  
    **When** the scan completes,  
    **Then** the deployment pipeline fails and the finding is filed as a P0 issue.

---

## Part 4: Prioritized Roadmap

| Priority | Stories | Theme | Effort |
| :---: | :--- | :--- | :---: |
| **P0 — Critical** | `US-ADV-1.1`, `US-ADV-1.2` | Authentication & Server-Side RBAC | 1 sprint |
| **P0 — Critical** | Fix `US-1.1` (progress bar, format validation, retry) | Upload UX Completeness | 3 days |
| **P0 — Critical** | Fix `US-3.2` (inline text highlights) | Compliance Highlight Overlay | 2 days |
| **P1 — High** | `US-ADV-6.1` | PostgreSQL Migration | 1 sprint |
| **P1 — High** | `US-ADV-2.1` | Document Versioning | 1 sprint |
| **P1 — High** | `US-ADV-3.1` | Encryption at Rest | 1 sprint |
| **P1 — High** | `US-ADV-9.1` | E2E Playwright Tests | 1 sprint |
| **P2 — Medium** | `US-ADV-5.1`, `US-ADV-5.2` | Real-Time Collaboration | 1 sprint |
| **P2 — Medium** | `US-ADV-4.1`, `US-ADV-4.2` | Analytics & Reporting | 1 sprint |
| **P2 — Medium** | `US-ADV-6.2`, `US-ADV-6.3` | Upload UX & Rate Limiting | 1 sprint |
| **P3 — Future** | `US-ADV-7.1`, `US-ADV-7.2` | Notifications & External Sharing | 1 sprint |
| **P3 — Future** | `US-ADV-8.1`, `US-ADV-8.2` | Full-Text Search & AI Flagging | 2 sprints |
| **P3 — Future** | `US-ADV-2.2`, `US-ADV-3.2` | Retention Policies & Watermarking | 1 sprint |
| **P3 — Future** | `US-ADV-9.2` | Security Pen Testing | 3 days |
