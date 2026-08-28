# Acumen Virtual Data Room (VDR) — Features & Role Capabilities Matrix

## 1. Executive Overview

The **Acumen Virtual Data Room (VDR)** is an institutional-grade document repository and compliance management system designed for private equity funds, corporate deals, SEC regulatory filings, and independent audits.

This document details the complete **Platform Feature List** and the **"Who Can Do What" (RBAC Capabilities Matrix)** governing each user persona.

---

## 2. Platform Feature List

### 📂 A. Directory & File Explorer Pipeline
- **Collapsible Hierarchy Tree**: Live directory tree with nested expandable/collapsible folders and quick filter bookmarks (*All Disclosures*, *Confidential Only*, *Restricted Assets*).
- **Interactive Breadcrumb Navigation**: Path breadcrumb trail (`Home > Fund Alpha > SEC Filings`) with one-click jump to any ancestor folder.
- **Dual View Layout Modes**:
  - **Grid Card View**: Responsive cards displaying file extension icons, AES-256 security badges, compliance flag count indicators, relative dates, and context menus.
  - **Table View**: Dense, sortable multi-column table with multi-select checkboxes.
- **Real-Time Search & Filtering**:
  - Global keyword search across document names, folders, and tags.
  - Sensitivity filter pills (`All`, `Confidential`, `Restricted`, `Internal Only`, `Public`).
  - File extension filter dropdown (`.pdf`, `.md`, `.txt`, `.json`, `.png`, `.jpg`).
  - Multi-field sorting by **Name** (A→Z, Z→A), **Date Modified** (Newest/Oldest), **Size** (Largest/Smallest), or **Sensitivity Level** (Highest first).

---

### 🔍 B. Zero-Download Split-Screen Document Previewer
- **Side-by-Side Split Panel**: Opens without leaving the current directory or forcing file downloads to the local workstation.
- **Live Format Renderers**:
  - **Live PDF Viewer (`PdfViewer`)**: Embedded PDF viewing with page controls, zoom, fullscreen mode, and new-tab view.
  - **Live Image Viewer (`ImageViewer`)**: Supports `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp` with zoom in/out (30%–250%), 90° clockwise rotation, and fit-to-screen.
  - **Interactive JSON Tree Viewer (`JsonViewer`)**: Collapsible formatted JSON tree with one-click copy.
  - **Syntax Text Viewer (`TextViewer`)**: Line-numbered syntax viewer for Markdown, text, and code with **live compliance highlight banners**.
- **Previewer Tabs**:
  1. `Preview Canvas`: Live document rendering.
  2. `Compliance Flags`: List of active violation markers with severity chips, line citations, and inline resolution controls.
  3. `Access & RBAC`: 4x3 permissions overview with **Edit Permissions** modal launcher.
  4. `Document History`: MinIO S3 object key, MIME type, file ID, and file-specific audit events.

---

### 🛡️ C. Regulatory Compliance Engine
- **Compliance Violation Pinning**: Tag specific lines or sections (e.g. `Section 4.2 - Material Disclosures`) with regulatory flags.
- **Severity Levels**: `High` (Red), `Medium` (Amber), `Low` (Blue).
- **Interactive Inspection Modal**: Click any flagged line to open the **Compliance Risk Inspector** with rule citations and resolution options.
- **Flag Resolution**: Compliance officers can mark flags resolved with one click, logging an audit record.

---

### 📤 D. Drag-and-Drop Ingestion Pipeline
- **Upload Modal**: Drag-and-drop dropzone with animated boundary states and multi-file queue.
- **File Validation**: Enforces <50MB size limit and allowed file formats.
- **Security Tag Assignment**: Set classification (`Confidential`, `Restricted`, `Internal Only`, `Public`) before uploading.
- **MinIO Object Streaming**: Streams directly into MinIO S3 bucket `vdr-documents` with progress bar animation.

---

### 🔐 E. Granular 4x3 RBAC Security Matrix
- **4x3 Matrix Configuration**: Configure individual `canView`, `canEdit`, and `canShare` privileges per document for each institutional role.
- **Live Role Switcher**: Instant switching between personas in the header to simulate and verify real-time UI action locking.

---

### 📜 F. Activity Audit Trail (Non-Repudiation)
- **Slide-Out Timeline Drawer**: Real-time chronological audit trail of all system activities.
- **Tracked Actions**: `Uploaded`, `Viewed`, `Downloaded`, `Flagged`, `Permission Changed`, `Renamed`, `Deleted`.
- **Actor Badges**: Renders actor avatars, role chips, details message, and relative timestamps.
- **Interactive Filters**: Filter audit events by action type or user role.

---

### ⚡ G. Floating Batch Operations Dock
- **Multi-Select Bar**: Appears automatically when 2+ files are selected.
- **Batch Capabilities**: Bulk sensitivity update, bulk permanent delete, or clear selection.

---

# 👥 3. "Who Can Do What" — Role Capabilities Matrix

| Capability / Action | 👑 Admin (`Alexander Vance`) | 🛡️ Compliance Officer (`Elena Rostova`) | 💼 Advisor (`Marcus Sterling`) | 🔍 Auditor (`Sarah Chen, CPA`) |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Folders & Directory Tree** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** |
| **Search & Filter Disclosures** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** |
| **Zero-Download Split Preview** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** |
| **View Live PDFs & Images** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** |
| **Download Permitted Documents** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** |
| **Inspect Compliance Flags** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** |
| **Inspect Activity Audit Trail** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** |
| **Create New Folders** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |
| **Upload Documents (<50MB)** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |
| **Rename Files & Folders** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |
| **Edit Sensitivity Tags** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |
| **Delete Files / Folders** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |
| **Execute Bulk Batch Actions** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |
| **Add Regulatory Compliance Flags** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |
| **Resolve Compliance Flags** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |
| **Edit 4x3 RBAC Permission Matrix** | ✅ **Yes** | ✅ **Yes** | ❌ *Locked* | ❌ *Locked* |

---

## 4. Persona Descriptions & Responsibilities

### 👑 1. Admin (`Alexander Vance` — Managing General Partner)
- **Role Tier**: Tier 1 (Full Administrative Control)
- **Email**: `alexander.vance@vdr-capital.com`
- **Key Duties**:
  - Provision root fund directories and nested folder structures.
  - Configure and update the 4x3 granular RBAC matrix across all files and folders.
  - Perform batch operations (mass tag updates, multi-file deletions).
  - Manage MinIO S3 storage quotas, bucket health, and system-wide configurations.

### 🛡️ 2. Compliance Officer (`Elena Rostova` — Chief Compliance Officer)
- **Role Tier**: Tier 1 (Compliance & Governance)
- **Email**: `elena.rostova@vdr-capital.com`
- **Key Duties**:
  - Ingest sensitive SEC filings, Limited Partner agreements, and financial prospectuses.
  - Review documents line-by-line and attach **High/Medium/Low Compliance Flags** (e.g. SEC Rule 17a-4 compliance).
  - Review redacted covenants and mark validated items as **Resolved**.
  - Adjust access rights on sensitive fund directories.

### 💼 3. Senior Portfolio Advisor (`Marcus Sterling`)
- **Role Tier**: Tier 2 (Consumer Access)
- **Email**: `marcus.sterling@sterling-wealth.com`
- **Key Duties**:
  - Browse approved asset directories and read LP agreements.
  - Inspect structured JSON allocation metrics and Markdown covenants via zero-download preview.
  - Download authorized documents for client advisory.
  - *Restrictions*: Cannot create, edit, rename, delete, or modify permissions.

### 🔍 4. Independent External Auditor (`Sarah Chen, CPA`)
- **Role Tier**: Tier 3 (Strict Read-Only Audit & Forensic Inspection)
- **Email**: `sarah.chen@deloitte-audit.com`
- **Key Duties**:
  - Review immutable chronological audit logs to verify chain-of-custody.
  - Audit document checksums and MinIO storage keys.
  - Verify that regulatory compliance flags were properly logged and remediated.
  - *Restrictions*: All mutation, upload, deletion, and permission controls are permanently locked in the UI.
