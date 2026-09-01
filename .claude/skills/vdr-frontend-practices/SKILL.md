---
name: vdr-frontend-practices
description: >-
  Best practices and architectural guidelines for the Virtual Data Room Next.js 16 frontend.
  Use when building or modifying React components, Zustand state stores, TailwindCSS themes,
  zero-download previewers, accessible modals, and API client integrations.
---

# VDR Frontend Best Practices & Engineering Guidelines

This skill defines the architectural patterns, component conventions, and state management rules for the **Virtual Data Room (VDR)** Next.js 16 frontend.

---

## 🏛️ 1. Architecture & Technology Stack

* **Framework**: Next.js 16 (App Router + Turbopack)
* **Language**: TypeScript (`strict: true`)
* **Styling**: TailwindCSS with CSS custom properties (HSL tokens in `globals.css`)
* **State Management**: Zustand 5 (`src/store/useVDRStore.ts`)
* **Iconography**: `lucide-react`
* **API Client**: Modular fetch wrapper (`src/lib/api/vdrApi.ts`)

---

## 🧩 2. Component Design Principles

### A. Folder Structure Convention
```text
src/
├── app/                  # App Router entry points (layout.tsx, page.tsx, globals.css)
├── components/
│   ├── layout/           # Global shell (Navbar, SidebarTree)
│   ├── explorer/         # Directory browsing (FileGrid, FileTable, Breadcrumbs, BatchActionBar)
│   ├── previewer/        # Zero-download inspection (DocumentPreviewer, TextViewer, PdfViewer, JsonViewer)
│   ├── modals/           # Dialogs (UploadModal, NewFolderModal, RenameModal, PermissionModal)
│   ├── drawer/           # Slide-out panels (AuditLogDrawer)
│   └── ui/               # Reusable atomic UI (Badge, Toast)
├── lib/                  # Utilities (utils.ts, vdrApi.ts)
├── store/                # Zustand global store (useVDRStore.ts)
└── types/                # Core TypeScript interfaces (vdr.ts)
```

### B. Component Guidelines
1. **Client Components**: Prefix with `"use client";` for any interactive component using hooks or store listeners.
2. **Design Tokens**: Never hardcode colors like `#1e293b`. Use theme tokens:
   - `bg-surface`, `bg-surface-raised`, `bg-page`
   - `text-text-primary`, `text-text-secondary`, `text-text-muted`
   - `border-border`, `border-border-strong`
3. **Accessibility (a11y)**:
   - Use semantic tags (`<header>`, `<main>`, `<aside>`, `<button>`, `<table>`).
   - Listen for `Escape` to close active modals/preview panels.
   - Supply descriptive `title` and `aria-label` attributes on icon-only buttons.

---

## 🗄️ 3. State Management (Zustand 5) Best Practices

1. **Single Source of Truth**: Keep shared state (active folder, selected files, search queries, active persona) in `useVDRStore`.
2. **Granular Selectors**: Extract only the required state in child components to avoid unnecessary re-renders:
   ```tsx
   const isAuditor = useVDRStore((state) => state.currentUser.role === "Auditor");
   const files = useVDRStore((state) => state.files);
   ```
3. **Action-Driven Feedback**: Trigger standardized toast notifications on all asynchronous mutations (uploads, deletes, permission changes):
   ```tsx
   get().addToast({
     type: "success",
     title: "Item Renamed",
     message: `Renamed to "${newName}"`,
   });
   ```

---

## 🌐 4. API Client & Presigned Storage URLs

1. **Environment Configuration**: Always resolve the backend API via `process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"`.
2. **Presigned Download URLs**: When opening download streams:
   - Always open presigned URLs in a new tab (`window.open(url, "_blank")`).
   - Fall back to the direct backend streaming endpoint `/files/{id}/content` if MinIO S3 presigned generation is unavailable.
3. **Role Header Forwarding**: Attach `actorName` and `actorRole` on file mutations to ensure full audit attribution in the backend.

---

## 🛡️ 5. Role-Based Access Control (RBAC) UI Rules

* **Auditor Role Rule**: When `currentUser.role === "Auditor"`, strictly disable all mutation buttons (`Upload`, `New Folder`, `Rename`, `Delete`, `Edit Matrix`, `Add Flag`):
  ```tsx
  <button disabled={isAuditor} className="disabled:opacity-40 disabled:cursor-not-allowed">
    {isAuditor ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Plus className="w-3.5 h-3.5" />}
    <span>New Folder</span>
  </button>
  ```
