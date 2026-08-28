# VDR Platform — Core Pipeline User Stories & Workflow Specifications

This document outlines the actionable **User Stories**, **Acceptance Criteria (Given-When-Then)**, **Preconditions**, and **Edge-Case Handlers** for the 6 core operational pipelines of the **Virtual Data Room (VDR)** platform.

---

## 📌 Pipeline Summary Matrix

| Pipeline | Code | Story Title | Primary Actor | Target Milestone |
| :--- | :---: | :--- | :--- | :---: |
| **1. Document Ingestion** | `US-1.1` | Drag-and-Drop Batch File Ingestion & MinIO Storage | Compliance Officer / Manager | Phase 1 & 2 |
| | `US-1.2` | Auto-Classification & Security Tag Initialization | Compliance Officer | Phase 1 |
| **2. Search & Discovery** | `US-2.1` | Dual-Mode Tree & Grid Exploration with Breadcrumb Jump | Auditor / Advisor / Manager | Phase 1 |
| | `US-2.2` | Real-time Multi-Parameter Keyword Search & Sorting | Compliance Officer | Phase 1 |
| **3. Document Inspection** | `US-3.1` | Zero-Download Split-Screen Multi-Format Previewer | Compliance Officer / Auditor | Phase 1 |
| | `US-3.2` | Compliance Violation Highlighting & Risk Popover | Compliance Officer | Phase 1 |
| **4. Security Governance** | `US-4.1` | Visual Sensitivity Tagging & Metadata Classification | Compliance Officer / Admin | Phase 1 |
| | `US-4.2` | Role-Based Access Control (RBAC) & Action Gating | Administrator | Phase 1 & 3 |
| **5. Audit Trail** | `US-5.1` | Automated Activity Capture & Sliding Timeline Drawer | Auditor / Compliance Officer | Phase 1 & 3 |
| | `US-5.2` | Audit Log Filtering & Entity Drill-Down | Auditor | Phase 1 |
| **6. File Operations** | `US-6.1` | Directory Creation, Inline Rename & Safe Deletion | Portfolio Manager | Phase 1 |
| | `US-6.2` | Multi-File Batch Selection & Bulk Operations | Compliance Officer | Phase 1 |

---

## 🚀 Pipeline 1: Document Ingestion & Storage Pipeline

### **US-1.1: Drag-and-Drop Single & Batch File Ingestion**
> **As a** Compliance Officer & Portfolio Manager,  
> **I want to** drag and drop single or multiple financial documents (`.pdf`, `.txt`, `.md`, `.json`, `.png`) directly into the active folder view,  
> **So that** I can ingest files securely and rapidly without navigating cumbersome native file dialogs.

* **Preconditions**:
  * User is authenticated and active role has `canEdit` permission in the destination folder.
* **Acceptance Criteria**:
  * **Given** I am in directory `/Funds/2026-Q3-Disclosures/`,  
    **When** I drag files over the explorer viewport,  
    **Then** an animated, semi-transparent drop overlay appears with *"Drop files here to upload"*.
  * **When** I release the files,  
    **Then** an Upload Queue modal opens displaying:
    * File name & size
    * MIME badge (`PDF`, `MARKDOWN`, etc.)
    * Real-time progress bar transitioning from `Queued` → `Uploading` → `Complete`
  * **When** upload completes,  
    **Then** the document binary is stored in the MinIO `vdr-documents` bucket, metadata is saved, and the directory grid updates immediately without page reload.
* **Edge Cases & Error Handling**:
  * **Oversized Files (>50MB)**: Show immediate warning badge *"File exceeds 50MB maximum"* and prevent ingestion.
  * **Disallowed Formats (`.exe`, `.sh`, `.bat`)**: Display *"Unsupported format"* and discard.
  * **Network Disruption**: Display a *"Retry"* button on the failed file card.

---

### **US-1.2: Auto-Classification & Security Tag Initialization**
> **As a** Compliance Officer,  
> **I want** uploaded files to automatically default to a baseline sensitivity classification (`Internal Only` or parent folder inheritance) and initialize compliance scans,  
> **So that** no file enters the data room in an unclassified or unprotected state.

* **Acceptance Criteria**:
  * **Given** a new document ingestion,  
    **When** the record is created in state/database,  
    **Then** it automatically receives `sensitivity: 'Internal Only'` and generates matching RBAC permissions.

---

## 🔍 Pipeline 2: File Navigation, Search & Discovery Pipeline

### **US-2.1: Dual-Mode Tree & Grid Traversal with Breadcrumb Navigation**
> **As an** Auditor or Portfolio Manager,  
> **I want to** traverse nested directory hierarchies via a collapsible sidebar tree and interactive grid/table with breadcrumbs,  
> **So that** I can explore multi-tier fund portfolios intuitively.

* **Acceptance Criteria**:
  * **Given** a deep path (`Root > Fund Alpha > 2026 Filings > Compliance`),  
    **When** I click nested tree items or double-click grid folder cards,  
    **Then** the main viewport renders the folder contents smoothly and the breadcrumb bar updates in real-time.
  * **When** I click any parent crumb in the breadcrumb bar (e.g. `Fund Alpha`),  
    **Then** the explorer immediately navigates back to that level.
  * **When** I toggle between `Grid View` and `Table/List View`,  
    **Then** the layout switches seamlessly while preserving the current folder location and active item selection.

---

### **US-2.2: Real-time Multi-Parameter Keyword Search & Sorting**
> **As a** Compliance Officer,  
> **I want to** search file names and filter by Sensitivity Level or file format, and sort by multiple fields,  
> **So that** I can instantly pinpoint high-risk or recently modified disclosures among large document sets.

* **Acceptance Criteria**:
  * **Given** an open directory with multiple files,  
    **When** I type in the search bar,  
    **Then** results filter in real-time (<50ms latency) without page flicker.
  * **When** I apply a sensitivity filter (`Confidential`),  
    **Then** only documents tagged as `Confidential` are displayed.
  * **When** I sort by `Sensitivity Level`,  
    **Then** items sort in strict order: `Confidential` → `Restricted` → `Internal Only` → `Public`.

---

## 📄 Pipeline 3: In-App Document Inspection & Compliance Highlighting

### **US-3.1: Zero-Download Split-Screen Document Previewer**
> **As a** Compliance Officer or Auditor,  
> **I want to** select any document and inspect its content in a split-screen side panel without downloading raw files to my device,  
> **So that** I can review confidential disclosures securely and rapidly.

* **Acceptance Criteria**:
  * **Given** any file in the explorer,  
    **When** I click on the file card or click the "Preview" action,  
    **Then** the viewport transitions into a split-screen layout (explorer left, preview panel right).
  * **When** previewing Text/Markdown (`.txt`, `.md`),  
    **Then** it renders syntax-formatted typography with clean line spacing.
  * **When** previewing JSON (`.json`),  
    **Then** it renders an interactive collapsible tree with colored key-value syntax.
  * **When** previewing PDF or Images (`.pdf`, `.png`, `.jpg`),  
    **Then** it renders in an embedded canvas viewer with zoom in/out and page controls.
  * **When** I click the close button or press the `Escape` key,  
    **Then** the preview panel closes and restores full explorer width.

---

### **US-3.2: Compliance Flag Inspection & Visual Highlight Overlays**
> **As a** Compliance Officer,  
> **I want** flagged compliance sections (e.g. *PII Detected*, *SEC Rule 17a-4 Disclosures*, *Confidentiality Clause*) visually highlighted within document previews,  
> **So that** I can immediately identify regulatory risks without manually scanning hundreds of lines.

* **Acceptance Criteria**:
  * **Given** a document with compliance flags,  
    **When** the document is loaded in the previewer,  
    **Then** highlight markers render over flagged sections with severity color coding (`High: Red`, `Medium: Amber`, `Low: Blue`).
  * **When** I hover or click on a highlight marker,  
    **Then** an interactive tooltip popover displays the rule citation, violation severity, timestamp, and compliance note.

---

## 🛡️ Pipeline 4: Security Classification & RBAC Access Control

### **US-4.1: Sensitivity Tagging & Metadata Classification**
> **As a** Compliance Officer or Admin,  
> **I want to** update security sensitivity tags (`Confidential`, `Restricted`, `Internal Only`, `Public`) on files and folders,  
> **So that** confidentiality boundaries are visually clear and enforced.

* **Acceptance Criteria**:
  * **Given** any document,  
    **When** I change its classification via the tag selector dropdown,  
    **Then** the visual badge updates instantly across the explorer, previewer, and details drawer.
  * **When** sensitivity changes,  
    **Then** an automated audit log entry (`Permission Changed`) is triggered and logged.

---

### **US-4.2: Role Permission Management & Real-time Action Gating**
> **As an** Administrator,  
> **I want to** open the Permission Editor Modal to assign `View`, `Edit`, and `Share` rights across roles (`Admin`, `Compliance Officer`, `Advisor`, `Auditor`),  
> **So that** restricted roles cannot perform unauthorized file modifications.

* **Acceptance Criteria**:
  * **Given** a file or folder,  
    **When** I open the Permission Modal,  
    **Then** a 4x3 role permission matrix is displayed with interactive checkboxes.
  * **When** I save updated rights (e.g., removing `canEdit` for `Advisor`),  
    **Then** the updated permission policy is saved to state/DB immediately.
  * **When** the active user role is switched to `Auditor` (Read-Only),  
    **Then** all modification actions (`Upload`, `Rename`, `Delete`, `Edit Permissions`) are disabled or hidden with a lock tooltip.

---

## 📜 Pipeline 5: Audit Trail & Compliance Event Logging

### **US-5.1: Non-Repudiation Event Capture & Real-time Sliding Timeline Drawer**
> **As an** Auditor or Compliance Officer,  
> **I want** every major user interaction (`Uploaded`, `Viewed`, `Downloaded`, `Flagged`, `Renamed`, `Permission Changed`) automatically recorded in an immutable audit timeline drawer,  
> **So that** all document interactions are fully traceable for regulatory compliance.

* **Acceptance Criteria**:
  * **Given** a user performs an action (e.g. previews a file, modifies permissions, uploads a document),  
    **When** the action occurs,  
    **Then** a new audit record is generated containing:
      * Event ID & Target File Name
      * Action Type badge
      * Actor Avatar, Name, and Role
      * Specific change details & ISO timestamp (with relative time like "Just now")
  * **When** I click the "Audit Trail" button in the global header,  
    **Then** a sliding timeline drawer opens smoothly from the right edge showing chronological events.

---

### **US-5.2: Audit Trail Filtering & File History Drill-Down**
> **As an** Auditor,  
> **I want to** filter audit events by specific file, user role, or action type,  
> **So that** I can conduct targeted audit reviews during SEC compliance audits.

* **Acceptance Criteria**:
  * **Given** the Audit Log Drawer is open,  
    **When** I select a file filter or action filter (e.g. `Flagged`),  
    **Then** the timeline filters instantly to display only relevant historical entries.

---

## ⚡ Pipeline 6: File Lifecycle & Batch Operations

### **US-6.1: Folder Creation, In-place Renaming & Safe Deletion**
> **As a** Portfolio Manager,  
> **I want to** create folders, rename documents with inline validation, and delete obsolete files with safety prompts,  
> **So that** fund document structures stay organized and accurate.

* **Acceptance Criteria**:
  * **Given** the explorer view,  
    **When** I click "+ New Folder",  
    **Then** a modal opens prompting for folder name with instant empty/duplicate name validation.
  * **When** I select "Rename",  
    **Then** an inline input activates pre-filled with the current file name (preserving file extension automatically).
  * **When** I delete a file,  
    **Then** a confirmation dialog warns before removing the file from state/storage.

---

### **US-6.2: Multi-File Batch Selection & Bulk Operations**
> **As a** Compliance Officer,  
> **I want to** select multiple files using checkboxes and perform bulk operations (Batch Sensitivity Update, Batch Download, Batch Delete),  
> **So that** I can manage high-volume filing packages efficiently.

* **Acceptance Criteria**:
  * **Given** the file grid/table,  
    **When** I select 2 or more files,  
    **Then** a floating bottom action dock appears showing *"X items selected"* with action buttons.
  * **When** I click "Update Sensitivity → Confidential",  
    **Then** all selected items update their sensitivity tags simultaneously, and corresponding audit log entries are generated.
