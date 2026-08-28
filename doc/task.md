# Task 1: Build a Virtual Data Room (VDR) From Scratch

## 👤 High-Level User Story

> **As a** Compliance Officer & Portfolio Manager,  
> **I want** a secure, high-performance Virtual Data Room (VDR) interface,  
> **So that** I can organize, search, preview, and manage confidential financial documents with strict permission tags and full audit trail visibility.

---

## 🎯 Why Is This Needed?

Compliance teams manage thousands of sensitive client agreements, SEC disclosures, and financial audits. A clunky file browser causes lost documents and security mistakes. A VDR provides a fast, secure, and intuitive document hub with instant previews and permission controls.

---

## 📋 Concrete Task Breakdown (Build From Scratch)

### 1. Folder Hierarchy & File Explorer Component
* **Dynamic Tree & Grid Viewer**: Build folder navigation, breadcrumbs, search filtering, and multi-parameter sorting (by `Name`, `Date`, `File Type`, and `Sensitivity Level`).
* **Mock File Operations**: Implement an upload modal with a drag-and-drop zone, folder creation, inline/modal renaming, and multi-file batch selection.

### 2. In-App Document Previewer Panel
* **Split-Screen Side Panel**: Support interactive mock renderers for:
  * Text (`.txt`, `.md`)
  * PDF / Image Mock Renderers
  * JSON Document Views
* **Compliance Highlights**: Add highlight markers over flagged compliance text sections within previewed documents.

### 3. Permission Tagging & Access Control UI
* **Metadata Security Tags**: Implement visual sensitivity tags (`Confidential`, `Public`, `Internal Only`, `Restricted`).
* **Permission Editor Modal**: Enable assigning granular rights (`View`, `Edit`, `Share`) across role definitions (`Admin`, `Compliance Officer`, `Advisor`, `Auditor`).

### 4. Activity Audit Log Drawer
* **Sliding Timeline Drawer**: Chronological file history tracking events (`Uploaded`, `Viewed`, `Downloaded`, `Flagged`, `Permission Changed`) complete with timestamps and user avatars.

### 5. Responsive Layout & Micro-Animations
* **Polished UX**: Ensure pixel-perfect responsiveness with TailwindCSS, featuring dark/light mode support, crisp typography, subtle hover states, and smooth transitions.

---

## 🔍 Scope Boundaries

| Category | Details |
| :--- | :--- |
| **In Scope** | Next.js pages/components, TypeScript interfaces, TailwindCSS styling, mock file system state, drag-and-drop file upload UI, search/filter, split-screen previewer, permission modal, activity log drawer. |
| **Out of Scope** | Real cloud S3 bucket storage integration or serverless storage backends. |

---

## ✅ Acceptance Criteria (Definition of Done)

- [ ] **File Management**: Dynamic tree/grid explorer with breadcrumb navigation and instant search.
- [ ] **Document Previewer**: Split-screen document previewer rendering text/PDF mocks with highlight markers.
- [ ] **Access Control**: Functional permission modal updating document security tags.
- [ ] **Audit Trail**: Activity log drawer displaying chronological file interaction history.