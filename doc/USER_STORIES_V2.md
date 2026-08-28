# VDR Platform — User Stories v2
# Audit-Driven Revision & Expansion

> **Version**: `2.0.0`  
> **Based on Audit**: [AUDIT_AND_ADVANCED_STORIES.md](file:///Users/lucky/Acumen/virtual-data-room/AUDIT_AND_ADVANCED_STORIES.md)  
> **Audit Score**: 10/12 Complete · 2/12 Partial · 10 System Gaps · 18 New Stories  
> **Total v2 Stories**: **30 User Stories** across **11 Pipelines**

---

## 📌 Master Pipeline Matrix

| Pipeline | Stories | Theme | Phase |
| :--- | :---: | :--- | :---: |
| **1. Document Ingestion** | US-1.1 *(Fixed)*, US-1.2 | Upload, Classification | Phase 1 |
| **2. Search & Discovery** | US-2.1, US-2.2, US-2.3 *(New)* | Navigation, Search, Move | Phase 1 |
| **3. Document Inspection** | US-3.1, US-3.2 *(Fixed)*, US-3.3 *(New)* | Previewer, Highlights | Phase 1 |
| **4. Security Governance** | US-4.1, US-4.2, US-4.3 *(New)* | RBAC, Tagging, Server Guard | Phase 1-2 |
| **5. Audit Trail** | US-5.1, US-5.2, US-5.3 *(New)* | Logging, Filtering, Export | Phase 1-2 |
| **6. File Operations** | US-6.1, US-6.2, US-6.3 *(New)* | CRUD, Batch, Copy/Move | Phase 1-2 |
| **7. Authentication & Identity** | US-7.1, US-7.2 | JWT Auth, Session Mgmt | Phase 2 |
| **8. Document Versioning** | US-8.1, US-8.2 | Version Chain, Retention | Phase 2 |
| **9. Encryption & Protection** | US-9.1, US-9.2 | AES-256, Watermarking | Phase 2 |
| **10. Analytics & Reporting** | US-10.1, US-10.2 | Dashboard, PDF Reports | Phase 2-3 |
| **11. Scale & Collaboration** | US-11.1, US-11.2, US-11.3, US-11.4 | WebSocket, Rate Limit, Share | Phase 3 |

---

## 🚀 Pipeline 1: Document Ingestion & Storage

### **US-1.1 v2: Drag-and-Drop Batch File Ingestion with Real-Time Progress**
> **As a** Compliance Officer or Portfolio Manager,  
> **I want to** drag and drop single or multiple financial documents into the active folder with real-time upload progress tracking and client-side validation,  
> **So that** I can ingest files securely with clear feedback at every stage and recover gracefully from failures.

**Status**: 🔧 *Revised — fixes 3 gaps from v1 audit*

* **Preconditions**:
  * User is authenticated. Active role has `canEdit: true` on the destination folder.
* **Acceptance Criteria**:
  * **Given** I am in a directory,  
    **When** I drag files over the file explorer viewport,  
    **Then** an animated, high-contrast drop overlay appears with *"Drop files here to upload"* and an animated border pulse.
  * **When** I release the files,  
    **Then** an Upload Queue Modal opens showing per-file rows, each with:
    * File name, size, MIME badge (`PDF`, `TXT`, `JSON`, `PNG`)
    * Animated progress bar transitioning `Queued → Uploading → ✓ Stored`
    * Progress percentage updating in real-time via `XMLHttpRequest.upload.onprogress`
  * **When** the upload completes,  
    **Then** the binary is streamed to MinIO `vdr-documents` bucket, metadata saved to database, and the directory grid updates without page reload.
* **Edge Cases & Error Handling**:
  * **[NEW]** Client-side format guard — Files with extensions `.exe`, `.sh`, `.bat`, `.cmd`, `.msi`, `.vbs` are blocked **before upload starts** with an inline red badge: *"Blocked: Executable format not permitted"*.
  * **[NEW]** Client-side size guard — Files exceeding **50MB** are rejected immediately with *"File exceeds 50MB limit"* badge, before any network request is made.
  * **[NEW]** Retry on failure — If the network request fails, the failed file card shows a `↺ Retry` button. Clicking it re-queues only the failed file.
  * **[NEW]** Concurrent upload limit — Max 5 files uploading simultaneously; remaining files queue automatically.
* **API**: `POST /api/v1/files/upload` (multipart)
* **Frontend**: [UploadModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/UploadModal.tsx)

---

### **US-1.2: Default Security Tag & Compliance Initialization on Ingest**
> **As a** Compliance Officer,  
> **I want** uploaded documents to automatically initialize with `Internal Only` sensitivity and baseline RBAC permissions,  
> **So that** no file enters the data room in an unclassified or unprotected state.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** a successful file upload,  
    **When** the backend creates the record,  
    **Then** `sensitivity` defaults to `"Internal Only"` and 4 permission records are generated (Admin=full, Compliance Officer=full, Advisor=view only, Auditor=view only).
  * **Then** an audit log entry `"Uploaded"` is auto-created with the uploader's name and role.
* **API**: `POST /api/v1/files/upload` → auto-creates `PermissionModel` × 4 + `AuditLogModel`

---

## 🔍 Pipeline 2: File Navigation, Search & Discovery

### **US-2.1: Dual-Mode Tree & Grid Traversal with Breadcrumb Navigation**
> **As an** Auditor or Portfolio Manager,  
> **I want to** traverse nested directories via a collapsible sidebar tree and interactive grid/table with breadcrumbs,  
> **So that** I can explore multi-tier fund portfolios intuitively.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** a deep path (`Root > Fund Alpha > 2026 Filings > Compliance`),  
    **When** I click nested tree items or double-click grid folder cards,  
    **Then** the viewport renders folder contents and the breadcrumb bar updates in real-time.
  * **When** I click any parent crumb (e.g. `Fund Alpha`),  
    **Then** the explorer immediately navigates back to that level.
  * **When** I toggle between `Grid View` and `Table/List View`,  
    **Then** the layout switches seamlessly, preserving folder location and active item selection.
* **APIs**: `GET /api/v1/files/tree` · `GET /api/v1/folders/breadcrumbs/{id}`
* **Frontend**: [SidebarTree.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/layout/SidebarTree.tsx) · [FileGrid.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/FileGrid.tsx) · [FileTable.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/FileTable.tsx) · [Breadcrumbs.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/Breadcrumbs.tsx)

---

### **US-2.2: Real-time Multi-Parameter Search & Instant Sorting**
> **As a** Compliance Officer,  
> **I want to** search file names, filter by Sensitivity or file format, and sort by multiple fields,  
> **So that** I can instantly pinpoint high-risk or recently modified disclosures.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** a folder with multiple files, **When** I type in the search bar, **Then** results filter in real-time (<50ms latency) without page flicker.
  * **When** I apply a sensitivity filter (`Confidential`), **Then** only `Confidential` documents are displayed.
  * **When** I sort by `Sensitivity Level`, **Then** order is: `Confidential → Restricted → Internal Only → Public`.
* **API**: `GET /api/v1/files?search=&sensitivity=&fileType=&sortBy=&sortOrder=`
* **Frontend**: [ExplorerToolbar.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/ExplorerToolbar.tsx)

---

### **US-2.3: Drag-to-Move & File Copy Operations** *(New)*
> **As a** Portfolio Manager,  
> **I want to** drag files from the grid into a target folder in the sidebar tree and copy documents across directories,  
> **So that** I can reorganize fund document structures without deleting and re-uploading.

**Status**: 🆕 *New — addresses audit gap: missing move/copy endpoints*

* **Acceptance Criteria**:
  * **Given** a file in the grid,  
    **When** I drag it over a folder in the sidebar tree and release,  
    **Then** a `PATCH /api/v1/files/{id}/move` request updates `parentId` and the file disappears from the current view, appearing in the destination folder.
  * **Given** a file with right-click context menu,  
    **When** I select "Copy to…" and choose a destination folder,  
    **Then** `POST /api/v1/files/{id}/copy` creates a new record with a new `file_id` and MinIO object key, with all metadata duplicated.
  * **When** a move or copy completes,  
    **Then** an audit log entry `"Moved"` or `"Copied"` is created.
* **Edge Cases**:
  * Moving a folder into one of its own descendants must be rejected: `400 Bad Request — "Cannot move folder into its own subtree"`.
  * Copying a large file (>10MB) should display a progress indicator.
* **APIs (New)**: `PATCH /api/v1/files/{id}/move` · `POST /api/v1/files/{id}/copy`

---

## 📄 Pipeline 3: In-App Document Inspection & Compliance

### **US-3.1: Zero-Download Split-Screen Multi-Format Previewer**
> **As a** Compliance Officer or Auditor,  
> **I want to** inspect any document in a split-screen side panel without downloading files,  
> **So that** I can review confidential disclosures securely and rapidly.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** any file, **When** I click "Preview", **Then** the viewport transitions into split-screen layout.
  * **When** previewing `.txt` / `.md`, **Then** renders syntax-formatted typography with line numbering.
  * **When** previewing `.json`, **Then** renders an interactive collapsible tree with colored key-value syntax.
  * **When** previewing `.pdf`, **Then** renders in an embedded viewer with zoom, fullscreen, and new-tab options.
  * **When** previewing `.png`, `.jpg`, `.svg`, **Then** renders with zoom (30–250%), rotation, and fit-to-screen controls.
  * **When** I press `Escape` or click `×`, **Then** the panel closes and restores full explorer width.
* **Frontend**: [DocumentPreviewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/DocumentPreviewer.tsx) · [PdfViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/PdfViewer.tsx) · [ImageViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/ImageViewer.tsx) · [JsonViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/JsonViewer.tsx) · [TextViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/TextViewer.tsx)

---

### **US-3.2 v2: Inline Compliance Violation Highlighting with Hover Tooltips**
> **As a** Compliance Officer,  
> **I want** flagged compliance sections visually highlighted **within the document body** with hover tooltips,  
> **So that** I can immediately see risk locations in context without switching to a separate tab.

**Status**: 🔧 *Revised — fixes critical gap from v1 audit (flags were tab-only, not inline)*

* **Acceptance Criteria**:
  * **Given** a text document with compliance flags stored against it,  
    **When** the document loads in `TextViewer`,  
    **Then** each line or section matching a flag's `lineOrSection` value is rendered with a colored highlight `<span>`:
    * `High` severity → **Red** background `rgba(239, 68, 68, 0.2)` with red left border
    * `Medium` severity → **Amber** background `rgba(245, 158, 11, 0.2)` with amber left border
    * `Low` severity → **Blue** background `rgba(59, 130, 246, 0.2)` with blue left border
  * **When** I hover over a highlighted section,  
    **Then** an interactive tooltip popover appears containing:
    * Flag severity badge (High/Medium/Low)
    * Section reference (e.g., `Clause 4.2 — Material Exposure`)
    * Violation description / reason
    * ISO timestamp of when the flag was added
    * "Resolve Flag" button (disabled for Auditor role)
  * **When** a flag is resolved via the tooltip,  
    **Then** the highlight disappears, the tooltip closes, and the Compliance tab count decrements.
  * **Given** a PDF document with compliance flags,  
    **Then** flags are still displayed in the Compliance tab (inline overlay is text-only).
* **Frontend**: [TextViewer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/previewer/TextViewer.tsx) *(requires inline highlight rendering)*

---

### **US-3.3: Document Metadata & Version History Tab** *(New)*
> **As an** Auditor,  
> **I want** the Document History tab in the previewer to show complete file-specific audit events and MinIO storage metadata,  
> **So that** I can perform chain-of-custody verification for any document without leaving the previewer.

**Status**: 🆕 *New — extends existing History tab with file-specific audit feed*

* **Acceptance Criteria**:
  * **Given** I open the "History" tab in the document previewer,  
    **When** it loads,  
    **Then** it shows two sections:
    * **Storage Metadata**: File ID, MinIO storage key, MIME type, size, created date, last modified
    * **File Activity Feed**: Chronological list of audit events **for this specific file only**, fetched via `GET /api/v1/audit-logs?fileId={id}`
  * **Given** the file activity feed,  
    **When** rendered,  
    **Then** each event shows: action badge, actor name + role avatar, relative time, and event detail.
  * **When** I click an event in the feed,  
    **Then** it expands to show the full detail message.
* **API**: `GET /api/v1/audit-logs?fileId={id}&limit=20`

---

## 🛡️ Pipeline 4: Security Classification & RBAC

### **US-4.1: Sensitivity Tagging & Metadata Classification**
> **As a** Compliance Officer or Admin,  
> **I want to** update security sensitivity tags on files and folders,  
> **So that** confidentiality boundaries are visually clear and enforced.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** any document, **When** I change its classification via the tag selector, **Then** the visual badge updates instantly across the explorer, previewer, and details.
  * **When** sensitivity changes, **Then** an audit log entry `"Permission Changed"` is triggered.
* **API**: `PATCH /api/v1/files/{id}` with `{sensitivity: "Confidential"}`

---

### **US-4.2: Role Permission Management & UI Action Gating**
> **As an** Administrator,  
> **I want to** open the Permission Editor Modal to assign `View`, `Edit`, `Share` rights across all 4 roles,  
> **So that** restricted roles cannot perform unauthorized file modifications.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** a file or folder, **When** I open the Permission Modal, **Then** a 4×3 role matrix is shown with interactive checkboxes.
  * **When** I save updated rights, **Then** the updated permission policy is persisted immediately.
  * **When** the active role is `Auditor`, **Then** all mutation actions (Upload, Rename, Delete, Edit Permissions, Add Flag) are disabled with a lock icon tooltip.
* **Frontend**: [PermissionModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/PermissionModal.tsx)

---

### **US-4.3: Server-Side RBAC Middleware & Permission Guard** *(New)*
> **As a** Security Engineer,  
> **I want** every mutation API endpoint to evaluate the requesting user's role against the document's permission matrix,  
> **So that** RBAC policies cannot be bypassed by direct API calls, regardless of UI state.

**Status**: 🆕 *New — addresses Critical Gap G-2 from audit*

* **Preconditions**: US-7.1 (JWT Auth) must be implemented first.
* **Acceptance Criteria**:
  * **Given** an authenticated Auditor making `DELETE /api/v1/files/{id}`,  
    **When** the RBAC middleware evaluates the request,  
    **Then** `403 Forbidden` is returned with `{"detail": "Insufficient permissions: canEdit required"}`.
  * **Given** a file where `Advisor.canEdit = false`,  
    **When** an authenticated Advisor sends `PATCH /api/v1/files/{id}`,  
    **Then** `403 Forbidden` is returned.
  * **Given** a folder where `canView = false` for a role,  
    **When** a user of that role calls `GET /api/v1/files?parentId={id}`,  
    **Then** `403 Forbidden` is returned — no listing of restricted directory contents.
  * **Given** any API request,  
    **When** the RBAC middleware runs,  
    **Then** it extracts the `role` claim from the JWT, loads the target file's `PermissionModel`, evaluates the required right, and only then routes to the handler — all in <5ms.
* **Edge Cases**:
  * Admin role always bypasses permission checks (super-admin bypass).
  * Cascade permission: If parent folder denies `canView`, deny all children regardless of their individual permissions.
* **Implementation**: FastAPI `Depends()` middleware injected into all `POST`, `PATCH`, `PUT`, `DELETE` route handlers.

---

## 📜 Pipeline 5: Audit Trail & Compliance Event Logging

### **US-5.1: Non-Repudiation Event Capture & Real-time Timeline Drawer**
> **As an** Auditor or Compliance Officer,  
> **I want** every user interaction automatically recorded in an immutable audit timeline,  
> **So that** all document interactions are fully traceable for regulatory compliance.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** a user performs any action (upload, view, rename, delete, flag, permission change, download),  
    **When** the action occurs,  
    **Then** a new audit record is generated with: Event ID, file name, action badge, actor name/role/avatar, detail text, and ISO timestamp.
  * **When** I click "Audit Trail" in the header, **Then** a sliding drawer opens from the right showing chronological events.
* **Frontend**: [AuditLogDrawer.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/drawer/AuditLogDrawer.tsx)
* **API**: `GET /api/v1/audit-logs` · `POST /api/v1/audit-logs`

---

### **US-5.2: Audit Trail Filtering & File-Specific Drill-Down**
> **As an** Auditor,  
> **I want to** filter audit events by file, user role, or action type,  
> **So that** I can conduct targeted audit reviews during SEC compliance audits.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** the Audit Log Drawer is open,  
    **When** I select a file filter or action filter (e.g. `Flagged`),  
    **Then** the timeline instantly shows only relevant events.
* **API**: `GET /api/v1/audit-logs?fileId=&role=&action=&limit=&skip=`

---

### **US-5.3: Audit Log CSV Export for Regulatory Submission** *(New)*
> **As an** Auditor (Sarah Chen, CPA),  
> **I want to** export the complete audit log or a filtered subset as a downloadable CSV file,  
> **So that** I can submit it to regulators (SEC, FINRA) or attach it to board audit packages offline.

**Status**: 🆕 *New — addresses audit gap: no offline export capability*

* **Acceptance Criteria**:
  * **Given** the Audit Log Drawer is open,  
    **When** I click "Export CSV",  
    **Then** the browser downloads `vdr-audit-export-{YYYY-MM-DD}.csv` containing columns:
    `Event ID`, `Timestamp (ISO)`, `Action`, `File Name`, `File ID`, `Actor Name`, `Actor Role`, `Details`
  * **Given** I have applied active filters (e.g., `action=Flagged`, `role=Compliance Officer`),  
    **When** I export,  
    **Then** the CSV contains **only the filtered records**, not the full log.
  * **When** the export contains >1,000 rows,  
    **Then** a progress indicator is shown and the file downloads as a streaming response.
* **API (New)**: `GET /api/v1/audit-logs/export?format=csv&fileId=&role=&action=`
* **Implementation**: FastAPI `StreamingResponse` with `text/csv` content type.

---

## ⚡ Pipeline 6: File Lifecycle & Batch Operations

### **US-6.1: Folder Creation, In-place Renaming & Safe Deletion**
> **As a** Portfolio Manager,  
> **I want to** create folders, rename documents, and delete obsolete files with safety prompts,  
> **So that** fund document structures stay organized and accurate.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **When** I click "+ New Folder", **Then** a modal opens with empty/duplicate name validation.
  * **When** I select "Rename", **Then** an inline input activates pre-filled with the current name (preserving extension).
  * **When** I delete a file, **Then** a confirmation dialog appears before removing from storage.
* **Frontend**: [NewFolderModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/NewFolderModal.tsx) · [RenameModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/RenameModal.tsx) · [DeleteConfirmModal.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/modals/DeleteConfirmModal.tsx)

---

### **US-6.2: Multi-File Batch Selection & Bulk Operations**
> **As a** Compliance Officer,  
> **I want to** select multiple files and perform bulk operations (Sensitivity Update, Bulk Delete),  
> **So that** I can manage high-volume filing packages efficiently.

**Status**: ✅ *Complete — no changes*

* **Acceptance Criteria**:
  * **Given** the file grid, **When** I select 2+ files, **Then** a floating bottom action dock appears with `"X items selected"` and action buttons.
  * **When** I click "Update Sensitivity → Confidential", **Then** all selected items update tags simultaneously with corresponding audit entries.
* **Frontend**: [BatchActionBar.tsx](file:///Users/lucky/Acumen/virtual-data-room/frontend/src/components/explorer/BatchActionBar.tsx)
* **APIs**: `POST /api/v1/files/batch-delete` · `POST /api/v1/files/batch-tag`

---

### **US-6.3: Select-All, Keyboard Shortcuts & Context Menu** *(New)*
> **As a** Compliance Officer or Admin,  
> **I want** a "Select All" checkbox in the table view header and keyboard shortcuts for common actions,  
> **So that** power users can navigate and operate the VDR at maximum speed without relying solely on mouse interactions.

**Status**: 🆕 *New — addresses audit gap: select-all missing, no keyboard navigation*

* **Acceptance Criteria**:
  * **Given** the Table/List view,  
    **When** I click the header checkbox,  
    **Then** all visible files are selected; clicking again deselects all.
  * **Given** any file selected,  
    **When** I press `Delete` (or `Backspace` on Mac),  
    **Then** the delete confirmation modal opens for the selected file(s).
  * **When** I press `Space` with a file focused,  
    **Then** the split-screen previewer opens for that file.
  * **When** I press `Escape`,  
    **Then** the previewer closes or the current modal dismisses.
  * **When** I right-click a file card in Grid view,  
    **Then** a context menu appears with actions: Preview, Rename, Edit Sensitivity, Edit Permissions, Copy, Move, Download, Delete — each disabled based on current role's permissions.
* **New Keyboard Shortcuts Table**:

  | Key | Action |
  | :--- | :--- |
  | `Space` | Preview selected file |
  | `Escape` | Close previewer / modal |
  | `Delete` / `Backspace` | Delete prompt for selection |
  | `Ctrl+A` | Select all in current folder |
  | `Ctrl+C` | Copy selected file |
  | `F2` | Rename selected file |

---

## 🔐 Pipeline 7: Authentication & Identity

### **US-7.1: JWT Authentication & Secure Session Management** *(New)*
> **As a** System Administrator,  
> **I want** all API endpoints protected by JWT Bearer token authentication with refresh token rotation,  
> **So that** only authenticated users can access the VDR and no anonymous API calls are possible.

**Status**: 🆕 *New — addresses Critical Gap G-1 from audit*

* **Acceptance Criteria**:
  * **Given** an unauthenticated request to any `/api/v1/*` endpoint,  
    **When** the request arrives without a valid `Authorization: Bearer <token>` header,  
    **Then** the server responds with `401 Unauthorized`.
  * **Given** valid credentials submitted to `POST /api/v1/auth/login`,  
    **When** credentials are verified,  
    **Then** the server returns:
    * `accessToken` (15-minute TTL, RS256-signed JWT with `userId`, `role`, `email` claims)
    * `refreshToken` (7-day TTL, stored in `HttpOnly` cookie)
  * **Given** an expired access token,  
    **When** the client calls `POST /api/v1/auth/refresh`,  
    **Then** a new access token is issued and the old refresh token is rotated.
  * **Given** a user clicks "Log Out",  
    **When** `POST /api/v1/auth/logout` is called,  
    **Then** both tokens are blocklisted server-side (Redis blocklist) and the client is redirected to `/login`.
* **Edge Cases**:
  * After 5 failed login attempts within 10 minutes, the account is locked for 15 minutes with `423 Locked`.
  * Concurrent sessions from different devices each maintain independent refresh chains.
  * All tokens include a `jti` (JWT ID) claim for individual token revocation.
* **APIs (New)**: `POST /api/v1/auth/login` · `POST /api/v1/auth/refresh` · `POST /api/v1/auth/logout`
* **Frontend (New)**: `/login` page, `AuthGuard` wrapper component, token interceptor in `vdrApi.ts`

---

### **US-7.2: Login Page, Auth Guards & Role-Aware Navigation** *(New)*
> **As a** user of any role,  
> **I want** a branded login page and automatic redirection to role-appropriate views after login,  
> **So that** the authentication flow is seamless and users land on the most relevant content for their role.

**Status**: 🆕 *New — frontend companion to US-7.1*

* **Acceptance Criteria**:
  * **Given** I navigate to `http://localhost:3000` without a valid session,  
    **When** the page loads,  
    **Then** I am redirected to `/login` with a branded VDR login form (email + password + "Sign In" button).
  * **When** I log in as `Auditor`,  
    **Then** I am redirected to `/` with the audit drawer pre-opened and all mutation controls hidden.
  * **When** I log in as `Admin`,  
    **Then** I am redirected to `/` with full control panel and a "System Status" widget in the navbar.
  * **Given** a valid session,  
    **When** I navigate to any protected route,  
    **Then** the `AuthGuard` component verifies token validity and renders the protected content.
* **Edge Cases**:
  * Session expiry mid-session: Token refresh is attempted silently; if refresh fails, user is redirected to `/login` with a `"Session expired — please sign in again"` toast.

---

## 📂 Pipeline 8: Document Versioning & Lifecycle

### **US-8.1: Document Version Control with Full History Chain** *(New)*
> **As a** Compliance Officer,  
> **I want to** upload new versions of existing documents while retaining complete version history,  
> **So that** I can trace the evolution of regulatory filings and roll back to any prior version.

**Status**: 🆕 *New — addresses audit Gap G-3*

* **Acceptance Criteria**:
  * **Given** `SEC-Filing-Q3.pdf` exists in a folder,  
    **When** I upload a new file with the same name,  
    **Then** the system prompts: *"A file with this name already exists. Upload as a new version or keep both?"*
  * **When** I choose "New Version",  
    **Then** the previous MinIO object is archived at key `{fileId}/v{n}`, `currentVersion` increments to `n+1`, and the `file_versions` table records the change.
  * **Given** a versioned document,  
    **When** I open the History tab in the previewer,  
    **Then** I see a version list: version number, upload timestamp, uploader name, file size, and a "Restore to this version" button.
  * **When** I click "Restore" on version 2,  
    **Then** version 2 becomes `v{n+1}` (immutability preserved), an audit log records `"Version Restored"`, and the previewer reloads with the restored content.
* **APIs (New)**: `GET /api/v1/files/{id}/versions` · `POST /api/v1/files/{id}/versions/restore/{version_number}`
* **DB (New)**: `file_versions` table (`file_id`, `version_number`, `storage_key`, `size_bytes`, `uploaded_by`, `uploaded_at`)

---

### **US-8.2: Document Retention Policy & Expiry Engine** *(New)*
> **As a** Compliance Officer,  
> **I want to** set folder-level retention policies and document-level expiration dates,  
> **So that** the VDR enforces regulatory retention windows (SEC Rule 17a-4 mandates 6-year retention) and alerts before scheduled purges.

**Status**: 🆕 *New — regulatory compliance requirement*

* **Acceptance Criteria**:
  * **Given** a folder `/SEC Filings/2020`,  
    **When** I set a retention policy of `6 years` via the folder settings modal,  
    **Then** all files in that folder receive `retain_until = 2026-12-31` and deletion attempts return `403 — Document is within retention period`.
  * **Given** a file with `expires_at = 2027-01-15`,  
    **When** the current date reaches 30 days before expiry,  
    **Then** the file card shows a `⚠️ Expiring in 30 days` amber badge and an email notification is sent to the Compliance Officer.
  * **When** the expiry date passes,  
    **Then** the file is moved to a `Quarantine` zone (not deleted), accessible only to Admin and Compliance Officer, awaiting explicit approval for permanent deletion.
* **API (New)**: `PATCH /api/v1/folders/{id}/retention` · `PATCH /api/v1/files/{id}/expiry`

---

## 🔒 Pipeline 9: Encryption & Data Protection

### **US-9.1: AES-256 At-Rest Encryption for MinIO Objects** *(New)*
> **As a** Security Administrator,  
> **I want** all file binaries stored in MinIO encrypted with AES-256-GCM via envelope encryption,  
> **So that** storage compromise does not expose document contents.

**Status**: 🆕 *New — addresses audit Gap G-4*

* **Acceptance Criteria**:
  * **Given** a file upload,  
    **When** the backend receives the binary,  
    **Then** it generates a unique 256-bit Data Encryption Key (DEK), encrypts the file with AES-256-GCM, wraps the DEK with the master Key Encryption Key (KEK), and stores `{ciphertext, wrapped_dek, nonce}` in MinIO.
  * **Given** a file download request,  
    **When** the backend retrieves the MinIO object,  
    **Then** it unwraps the DEK, decrypts the ciphertext, and streams plaintext to the client.
  * **Given** a KEK rotation event triggered by `POST /api/v1/admin/rotate-kek`,  
    **When** the rotation runs,  
    **Then** all wrapped DEKs are re-wrapped with the new KEK without re-encrypting file contents.
  * **When** encryption is enabled,  
    **Then** a `🔐` lock icon appears on all file cards indicating encrypted storage.

---

### **US-9.2: Forensic Download Watermarking** *(New)*
> **As a** Compliance Officer,  
> **I want** every downloaded document to be invisibly watermarked with the downloader's identity and timestamp,  
> **So that** leaked documents can be forensically traced back to the source user.

**Status**: 🆕 *New — addresses audit Gap G-10*

* **Acceptance Criteria**:
  * **Given** a user downloads a PDF,  
    **When** the backend streams the file,  
    **Then** it injects a steganographic or metadata watermark containing: `userId`, `userName`, `role`, `downloadTimestamp`, `sessionId`.
  * **Given** a watermarked document is recovered externally,  
    **When** `GET /api/v1/admin/watermark/verify` receives the file,  
    **Then** it extracts and returns the embedded identity data, linking to the exact audit log `Downloaded` event.
  * **When** a document is watermarked,  
    **Then** an audit log entry records `"Downloaded (Watermarked)"` with the watermark hash stored for future verification.

---

## 📊 Pipeline 10: Analytics & Reporting

### **US-10.1: Executive Compliance Health Dashboard** *(New)*
> **As a** Managing General Partner (Admin),  
> **I want** a visual analytics dashboard with compliance health metrics, activity heatmaps, and risk summaries,  
> **So that** I can assess the regulatory posture of the entire data room at a glance.

**Status**: 🆕 *New — analytics gap identified in audit*

* **Acceptance Criteria**:
  * **Given** I navigate to `/dashboard`,  
    **When** the page loads,  
    **Then** I see:
    * **Compliance Score** — % of documents with zero unresolved flags (e.g., `87% Clean`)
    * **Risk Distribution** — Donut chart of High / Medium / Low unresolved flag counts
    * **Activity Heatmap** — 30-day calendar grid with color intensity for upload/view/download activity
    * **Top 10 Most Accessed Documents** — Ranked by view + download event count
    * **Pending Actions** — Files with unresolved High-severity flags, sorted by age
    * **Storage Summary** — Total MinIO usage, file count, folder count per sensitivity level
  * **When** I click any metric card,  
    **Then** it navigates to the filtered file explorer or filtered audit trail.
* **API (New)**: `GET /api/v1/stats` → `{fileCount, folderCount, totalSizeBytes, flagCounts, activityByDay, topFiles}`

---

### **US-10.2: Automated Compliance Report Generation (PDF Export)** *(New)*
> **As a** Compliance Officer,  
> **I want to** generate a downloadable PDF compliance report for a date range,  
> **So that** I can submit it to regulators or board members without manual compilation.

**Status**: 🆕 *New*

* **Acceptance Criteria**:
  * **Given** I open the Reports page and select date range `2026-Q3`,  
    **When** I click "Generate Report",  
    **Then** the backend produces a branded PDF containing:
    * Executive summary: total files, uploads, downloads, flag counts
    * Chronological audit trail table for the period
    * Unresolved compliance flags with severity and affected documents
    * Permission change log with before/after role matrices
    * Digital signature timestamp of report generation
  * **When** generation completes,  
    **Then** the PDF is stored in MinIO under `/reports/` prefix, an audit log records `"Report Generated"`, and a download link appears.
* **API (New)**: `POST /api/v1/reports/generate` · `GET /api/v1/reports/{report_id}/download`

---

## ⚡ Pipeline 11: Scale, Collaboration & Sharing

### **US-11.1: WebSocket Real-Time Multi-User Sync** *(New)*
> **As a** Portfolio Manager working alongside a Compliance Officer,  
> **I want** the file explorer and audit trail to update in real-time when other users make changes,  
> **So that** I always see the current state without manually refreshing.

**Status**: 🆕 *New — addresses audit Gap G-9*

* **Acceptance Criteria**:
  * **Given** User A and User B are both viewing the same folder,  
    **When** User A uploads a document,  
    **Then** User B's grid renders the new file within 2 seconds with a `✨ Added by Alexander Vance` micro-notification.
  * **When** the WebSocket connection drops,  
    **Then** the client reconnects automatically and performs a delta-sync from the last known event timestamp.
* **Implementation**: FastAPI `WebSocket` endpoint at `ws://localhost:8000/ws/updates` broadcasting `{type, payload}` events.

---

### **US-11.2: Upload Progress Streaming & Resumable Uploads** *(New)*
> **As a** Compliance Officer uploading a 40MB fund prospectus,  
> **I want** real-time upload progress and the ability to resume interrupted uploads,  
> **So that** I don't lose progress if my VPN drops mid-upload.

**Status**: 🆕 *New — addresses audit Gap US-1.1 edge case*

* **Acceptance Criteria**:
  * **Given** a large file upload begins,  
    **When** the upload is in progress,  
    **Then** the progress bar shows real-time percentage (0% → 100%) via `XMLHttpRequest.upload.onprogress`.
  * **Given** a network drop at 60% uploaded,  
    **When** I click "Resume",  
    **Then** the upload continues from the last confirmed byte offset using chunked upload with backend byte tracking.

---

### **US-11.3: Secure External Document Sharing with Expiring Links** *(New)*
> **As a** Senior Portfolio Advisor,  
> **I want to** generate time-limited, optionally password-protected shareable links for specific documents,  
> **So that** external stakeholders (Limited Partners, legal counsel) can access specific files without needing a VDR account.

**Status**: 🆕 *New*

* **Acceptance Criteria**:
  * **Given** I select a document and click "Share Externally",  
    **When** I configure: expiry (72 hours), password (optional), max downloads (5),  
    **Then** a unique URL `https://vdr.acumen.io/share/{token}` is generated and copied to clipboard.
  * **Given** a share link is clicked after expiry,  
    **When** the token is validated,  
    **Then** *"This link has expired"* is rendered and an audit entry `"Share Link Expired"` is logged.
  * **Given** the max download count is reached,  
    **When** the next download is attempted,  
    **Then** access is denied with *"Download limit reached"*.
* **APIs (New)**: `POST /api/v1/files/{id}/share` · `GET /api/v1/share/{token}` (public, no auth required)

---

### **US-11.4: API Rate Limiting & Request Throttling** *(New)*
> **As a** Security Administrator,  
> **I want** all API endpoints to enforce per-user rate limits,  
> **So that** the system is protected against abuse, scraping, and denial-of-service attacks.

**Status**: 🆕 *New — addresses audit Gap G-5*

* **Acceptance Criteria**:
  * **Given** a user sending >100 `GET` requests per minute,  
    **When** the 101st request arrives,  
    **Then** `429 Too Many Requests` is returned with `Retry-After` header.
  * **Given** a user sending >20 write operations (`POST`, `PUT`, `PATCH`, `DELETE`) per minute,  
    **When** the 21st arrives,  
    **Then** `429 Too Many Requests` with a 60-second cooldown.
  * **Given** any response,  
    **Then** it includes headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
* **Implementation**: `slowapi` FastAPI middleware backed by Redis counter per `user_id`.

---

## 📐 Definition of Done — v2 Checklist

### Phase 1 (Core Fixes & Gaps)
- [ ] **US-1.1 v2**: Client-side format blocking, real-time progress bar, retry button
- [ ] **US-3.2 v2**: Inline highlight spans in TextViewer with hover tooltip
- [ ] **US-2.3**: Move file endpoint + drag-to-move UI
- [ ] **US-3.3**: File-specific audit feed in History tab
- [ ] **US-5.3**: Audit log CSV export endpoint + UI button
- [ ] **US-6.3**: Select-All checkbox, keyboard shortcuts, right-click context menu
- [ ] **US-4.3**: Server-side RBAC middleware (requires US-7.1)

### Phase 2 (Security & Versioning)
- [ ] **US-7.1**: JWT auth endpoints + token refresh + blocklist
- [ ] **US-7.2**: `/login` page + AuthGuard + role-aware redirect
- [ ] **US-8.1**: Version chain + MinIO archival + Restore UI
- [ ] **US-8.2**: Retention policy engine + expiry alerts
- [ ] **US-9.1**: AES-256-GCM encryption + KEK rotation
- [ ] **US-9.2**: Forensic watermarking on PDF downloads

### Phase 3 (Scale & Intelligence)
- [ ] **US-10.1**: Analytics dashboard with stats API
- [ ] **US-10.2**: PDF report generation + MinIO storage
- [ ] **US-11.1**: WebSocket real-time sync
- [ ] **US-11.2**: Resumable uploads with progress streaming
- [ ] **US-11.3**: External share links with expiry + password
- [ ] **US-11.4**: Rate limiting with Redis

---

## 🗺️ API Contract Summary — v2

| Method | Endpoint | Story | Status |
| :--- | :--- | :---: | :---: |
| `GET` | `/api/v1/files` | US-2.1, 2.2 | ✅ Live |
| `GET` | `/api/v1/files/tree` | US-2.1 | ✅ Live |
| `GET` | `/api/v1/files/{id}` | US-3.1 | ✅ Live |
| `POST` | `/api/v1/files/upload` | US-1.1 | ✅ Live |
| `GET` | `/api/v1/files/{id}/content` | US-3.1 | ✅ Live |
| `GET` | `/api/v1/files/{id}/download-url` | US-3.1 | ✅ Live |
| `PATCH` | `/api/v1/files/{id}` | US-4.1, 6.1 | ✅ Live |
| `DELETE` | `/api/v1/files/{id}` | US-6.1 | ✅ Live |
| `POST` | `/api/v1/files/batch-delete` | US-6.2 | ✅ Live |
| `POST` | `/api/v1/files/batch-tag` | US-6.2 | ✅ Live |
| `POST` | `/api/v1/folders` | US-6.1 | ✅ Live |
| `GET` | `/api/v1/folders/breadcrumbs/{id}` | US-2.1 | ✅ Live |
| `DELETE` | `/api/v1/folders/{id}` | US-6.1 | ✅ Live |
| `GET` | `/api/v1/files/{id}/permissions` | US-4.2 | ✅ Live |
| `PUT` | `/api/v1/files/{id}/permissions` | US-4.2 | ✅ Live |
| `POST` | `/api/v1/files/{id}/flags` | US-3.2 | ✅ Live |
| `DELETE` | `/api/v1/files/{id}/flags/{flag_id}` | US-3.2 | ✅ Live |
| `GET` | `/api/v1/audit-logs` | US-5.1, 5.2 | ✅ Live |
| `POST` | `/api/v1/audit-logs` | US-5.1 | ✅ Live |
| `GET` | `/api/v1/users` | US-4.2 | ✅ Live |
| **`PATCH`** | **`/api/v1/files/{id}/move`** | **US-2.3** | 🆕 Needed |
| **`POST`** | **`/api/v1/files/{id}/copy`** | **US-2.3** | 🆕 Needed |
| **`GET`** | **`/api/v1/audit-logs/export`** | **US-5.3** | 🆕 Needed |
| **`GET`** | **`/api/v1/files/{id}/versions`** | **US-8.1** | 🆕 Needed |
| **`POST`** | **`/api/v1/files/{id}/versions/restore/{n}`** | **US-8.1** | 🆕 Needed |
| **`PATCH`** | **`/api/v1/folders/{id}/retention`** | **US-8.2** | 🆕 Needed |
| **`GET`** | **`/api/v1/stats`** | **US-10.1** | 🆕 Needed |
| **`POST`** | **`/api/v1/reports/generate`** | **US-10.2** | 🆕 Needed |
| **`POST`** | **`/api/v1/auth/login`** | **US-7.1** | 🆕 Needed |
| **`POST`** | **`/api/v1/auth/refresh`** | **US-7.1** | 🆕 Needed |
| **`POST`** | **`/api/v1/auth/logout`** | **US-7.1** | 🆕 Needed |
| **`POST`** | **`/api/v1/files/{id}/share`** | **US-11.3** | 🆕 Needed |
| **`GET`** | **`/api/v1/share/{token}`** | **US-11.3** | 🆕 Needed |
| **`WS`** | **`ws://host/ws/updates`** | **US-11.1** | 🆕 Needed |
