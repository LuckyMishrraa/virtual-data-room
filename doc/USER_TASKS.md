# Acumen Virtual Data Room (VDR) — Institutional User Tasks & Role Operations Guide

## 1. Executive Overview

The **Acumen Virtual Data Room (VDR)** is a high-security, bank-grade compliance and document governance platform engineered for private equity funds, investment banks, compliance officers, and independent external auditors.

This document outlines the **roles, responsibilities, operational boundaries, and step-by-step task workflows** for each user persona within the platform.

---

## 2. Institutional Personas & Role Matrix

| Persona Name | Title / Organization | Assigned Role | Security Level | Core Responsibility |
| :--- | :--- | :---: | :---: | :--- |
| **Alexander Vance** | Managing General Partner | `Admin` | Tier 1 (Full Control) | Provisioning root directories, configuring 4x3 RBAC access rules, batch operations, storage governance. |
| **Elena Rostova** | Chief Compliance Officer | `Compliance Officer` | Tier 1 (Compliance) | Ingesting SEC filings, regulatory risk reviews (SEC Rule 17a-4), pinning violation flags, resolving validated items. |
| **Marcus Sterling** | Senior Portfolio Advisor | `Advisor` | Tier 2 (Consumer) | Inspecting portfolio allocation metrics, reviewing LP covenants with zero-download previews, downloading permitted assets. |
| **Sarah Chen, CPA** | Independent External Auditor | `Auditor` | Tier 3 (Read-Only) | Forensic audit trail verification, document integrity check, non-repudiation logging review, regulatory certification. |

---

## 3. Granular 4x3 RBAC Permissions Matrix

Every document and folder in the VDR is governed by an explicit **4x3 Role-Based Access Control (RBAC)** matrix:

| Role | View Rights (`canView`) | Edit Rights (`canEdit`) | Share Rights (`canShare`) | Action Capabilities |
| :--- | :---: | :---: | :---: | :--- |
| **Admin** | ✅ Granted | ✅ Granted | ✅ Granted | Create folders, upload files, rename, delete, batch tag, edit RBAC permissions. |
| **Compliance Officer** | ✅ Granted | ✅ Granted | ✅ Granted | Create folders, upload files, rename, delete, pin compliance flags, resolve flags, edit RBAC permissions. |
| **Advisor** | ✅ Granted | ❌ Restricted | ❌ Restricted | Browse directories, inspect previews in split-screen, download authorized files. |
| **Auditor** | ✅ Granted | ❌ Restricted | ❌ Restricted | **Strict Read-Only**: Browse folders, preview documents, view compliance flags, inspect immutable audit trail. All mutation controls are locked. |

---

## 4. Step-by-Step User Task Workflows

---

### 👑 Role 1: Admin (`Alexander Vance`)

#### Task 1.1: Provision Root & Sub-Directory Hierarchies
1. **Navigate** to the target directory location using the dynamic **Breadcrumb Bar** or **Sidebar Directory Tree**.
2. **Click** the **`+ New Folder`** button in the top navigation bar.
3. In the modal, enter the folder name (e.g. `Fund Alpha - 2026 Asset Portfolios`).
4. Select the security classification (`Confidential`, `Restricted`, `Internal Only`, `Public`).
5. Click **`Create Folder`**. The folder is immediately registered, indexed, and an immutable `Uploaded` event is written to the audit log.

#### Task 1.2: Configure Granular 4x3 RBAC Permissions
1. Hover over any folder or file card in the **Grid View** (or row in the **Table View**).
2. Click the **`⋮` Actions Menu** and select **`Permissions`** (or click the **`Edit Matrix`** button inside the Document Previewer's *Access & RBAC* tab).
3. In the **RBAC Modal**, toggle the checkboxes for `View Rights`, `Edit Rights`, and `Share Rights` across `Admin`, `Compliance Officer`, `Advisor`, and `Auditor`.
4. Click **`Save Permission Matrix`**. Changes are immediately enforced, and a `Permission Changed` event is recorded.

#### Task 1.3: Execute Floating Batch Operations
1. Multi-select two or more documents by checking the selection checkboxes on each file card/row.
2. The **Floating Batch Action Dock** will appear at the bottom of the screen showing the selected count.
3. Click **`Set Sensitivity`** to bulk-update security tags (e.g., promote multiple files to `Confidential`).
4. Click **`Delete All`** to permanently remove multiple files and their associated MinIO storage objects simultaneously.

#### Task 1.4: Monitor MinIO Storage & Health
1. Review the **MinIO S3 Storage Status Meter** at the bottom of the Left Sidebar.
2. Verify that storage usage remains within quota thresholds and the service status displays `Online (Green)`.

---

### 🛡️ Role 2: Compliance Officer (`Elena Rostova`)

#### Task 2.1: Ingest Sensitive Financial Disclosures & SEC Filings
1. Navigate to the appropriate destination directory (e.g., `2026-Q3 SEC Filings`).
2. Click the **`Upload`** button in the header.
3. Select the required Security Classification tag (`Confidential` or `Restricted`).
4. Drag and drop single or multiple PDF reports, Markdown agreements, JSON metrics, or images into the dropzone (up to 50MB per file).
5. Click **`Upload File(s)`**. Files are transferred directly to the MinIO `vdr-documents` bucket and indexed in real-time.

#### Task 2.2: Review Documents & Pin Regulatory Compliance Flags
1. Click on any uploaded document in the explorer to open the **Zero-Download Split-Screen Previewer**.
2. Select the **`Preview`** tab:
   - For `.pdf` files, inspect using the **Live PDF Viewer** with page navigation and zoom.
   - For images (`.png`/`.jpg`), inspect using the **Image Viewer** with 90° rotation and zoom.
   - For text/markdown, review the line-numbered syntax text.
3. Switch to the **`Compliance`** tab and click **`+ Add Flag`**.
4. Input the violation details:
   - **Section / Line Reference**: e.g., `Clause 4.2 - Sovereign Fund Exposure`
   - **Severity Level**: `High`, `Medium`, or `Low`
   - **Violation Description**: e.g., `Unredacted counterparty identifier violates SEC Rule 17a-4 record governance.`
5. Click **`Save Flag`**. The document status updates to **Flagged**, highlighting the line reference in red/amber with a clickable badge.

#### Task 2.3: Resolve Verified Disclosures
1. In the document previewer's **Compliance** tab, locate the flagged marker.
2. Click **`Resolve Flag`** (or click the highlighted flag badge inside the document text to open the **Compliance Inspector Modal**).
3. Confirm resolution. The violation flag is cleared, and an audit trail log is recorded.

---

### 💼 Role 3: Senior Portfolio Advisor (`Marcus Sterling`)

#### Task 3.1: Search and Filter Institutional Assets
1. Use the **Global Search Bar** to instantly find documents by keywords, fund names, or tags across all folders.
2. Use the **Sensitivity Filter Pills** (`Confidential`, `Restricted`, `Internal`, `Public`) to isolate specific asset categories.
3. Filter by file format using the **File Type Dropdown** (`.pdf`, `.md`, `.json`, `.png`).
4. Sort items by **Name**, **Date Modified**, **Size**, or **Sensitivity**.

#### Task 3.2: Zero-Download Document Inspection
1. Click on any file card or row to open the side preview pane without downloading binaries to the local workstation.
2. Review structured financial metrics in the **JSON Viewer** (with copyable tree view) or read terms in the **Text Viewer**.
3. Check the **Access & RBAC** tab to verify permissions assigned to your role.

#### Task 3.3: Download Permitted Covenants
1. For files where download is authorized, click the **`Download`** icon in the preview header or card context menu.
2. The VDR generates a secure, presigned single-use MinIO stream, and automatically logs a `Downloaded` audit event.

---

### 🔍 Role 4: Independent External Auditor (`Sarah Chen, CPA`)

#### Task 4.1: Perform Read-Only Forensic Document Review
1. Switch to the **`Auditor`** persona using the top-right **Role Switcher**.
2. Notice that the UI dynamically enforces **Read-Only Mode**:
   - The **`+ Upload`** button is locked.
   - The **`+ New Folder`** button is locked.
   - All **`Rename`**, **`Delete`**, and **`Edit Permissions`** options are disabled with lock indicators.
3. Browse all directories and open split-screen previews to verify document content, MIME types, and MinIO storage keys.

#### Task 4.2: Inspect the Immutable Chronological Audit Trail
1. Click the **`Audit Trail`** button in the top navigation bar to open the slide-out timeline drawer.
2. Review the chronological stream of system events:
   - Event Action (`Uploaded`, `Viewed`, `Downloaded`, `Flagged`, `Permission Changed`, `Deleted`)
   - Actor Name, Role chip, and Avatar
   - Detailed event message (e.g. *Marked Section 4.2 with High Severity Compliance Flag*)
   - Relative and ISO-8601 UTC timestamp
3. Filter events using the **Action Chips** (`All`, `Uploaded`, `Flagged`, `Permission Changed`, `Downloaded`) or the **Role Filter Dropdown** to audit specific activities.

---

## 5. Summary Checklist of User Capabilities

| Feature / Action | Admin | Compliance Officer | Advisor | Auditor |
| :--- | :---: | :---: | :---: | :---: |
| Browse Folders & Files | ✅ | ✅ | ✅ | ✅ |
| Split-Screen Zero-Download Preview | ✅ | ✅ | ✅ | ✅ |
| Live PDF & Image Viewers | ✅ | ✅ | ✅ | ✅ |
| Create Folders | ✅ | ✅ | ❌ | ❌ |
| Upload Documents (<50MB) | ✅ | ✅ | ❌ | ❌ |
| Rename / Update Sensitivity | ✅ | ✅ | ❌ | ❌ |
| Delete Files / Folders | ✅ | ✅ | ❌ | ❌ |
| Bulk Multi-File Batch Actions | ✅ | ✅ | ❌ | ❌ |
| Add / Resolve Compliance Flags | ✅ | ✅ | ❌ | ❌ |
| Edit 4x3 RBAC Permission Matrix | ✅ | ✅ | ❌ | ❌ |
| View Activity Audit Trail | ✅ | ✅ | ✅ | ✅ |
