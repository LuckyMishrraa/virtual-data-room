# Acumen VDR — User Guide

## 1. What is Acumen VDR

Acumen VDR (Virtual Data Room) is a secure online workspace where your team can store, organize, and review confidential documents — SEC filings, fund agreements, financial statements, and similar sensitive files. You can browse folders, preview documents right in your browser without downloading them, flag compliance concerns, control who can see or change what, and see a complete history of everything that's happened to a document. Everyone using it has a role — Admin, Compliance Officer, Advisor, or Auditor — and what you can do depends on which one you are.

---

## 2. Your Role and What You Can Do

Every document and folder has its own set of rules for each role, but the platform follows the same general pattern everywhere.

### 👑 Admin

You have full control. You can:
- Browse, search, and preview every document and folder
- Upload new documents and create new folders
- Rename or delete anything
- Change a document's security classification (Confidential, Restricted, Internal Only, Public)
- Open the Permissions editor and decide exactly what each role can View, Edit, or Share on any given file
- Add and resolve compliance flags
- Select multiple files and run bulk actions (change sensitivity, delete)
- View the full audit trail

### 🛡️ Compliance Officer

You have the same day-to-day capabilities as an Admin. You can:
- Do everything listed under Admin above
- Your typical day-to-day: ingesting new filings, reviewing them for regulatory risk, pinning compliance flags to problem sections, and resolving flags once they're addressed

### 💼 Advisor

You have read access. You can:
- Browse folders, search, and filter documents
- Preview any document you have view access to, right in the browser
- Download a document, **but only if** an Admin or Compliance Officer has specifically granted you Share/Download rights on that document — by default, you can view but not download
- What you *cannot* do: upload files, create folders, rename or delete anything, change sensitivity tags, add or resolve compliance flags, or edit permissions. Every one of those controls will appear on screen but greyed out, with a tooltip explaining why

### 🔍 Auditor

You have strict read-only access, functionally the same restrictions as an Advisor. You can:
- Browse every folder and preview every document you have view access to
- Review compliance flags on any document
- Open the Audit Trail and filter it by action type or role — this is your primary tool
- Download documents only where explicitly granted, same as an Advisor
- Everything else (upload, create, rename, delete, tag, flag, permissions) is locked

> **How role-switching works in this environment:** the top-right corner of the screen has a role switcher that lets you preview the app as any of the four roles instantly, without logging in or out. This is useful for understanding what each role experiences, but it means the app does not currently have real login accounts — treat this as a demonstration/testing convenience, not a security boundary.

---

## 3. How Things Work — Step by Step

### Uploading a document

1. Click **Upload** in the top bar (only visible/enabled for Admin and Compliance Officer).
2. Choose a default security classification for the file — Internal Only, Confidential, Restricted, or Public.
3. Drag a file into the dropzone, or click to browse for one. You can queue up several files before uploading. Files over 50MB are rejected immediately with a warning.
4. Click **Upload File(s)**. Each file is sent to secure storage and a progress indicator fills in as each one finishes.
5. The moment a file is done, it appears at the top of the file list — no page refresh needed — already tagged with the classification you chose, and a record is added to the audit trail noting who uploaded it and when.

### Previewing a document without downloading it

1. Click anywhere on a file's card (Grid view) or row (Table view).
2. A panel slides open on the right side of the screen showing the document's contents directly — nothing is saved to your computer.
3. What you see depends on the file type: images and PDFs display natively with zoom controls; JSON data shows as a neatly formatted, collapsible tree you can copy; text and Markdown documents show with line numbers.
4. You can drag the left edge of the panel to resize it, or double-click the edge to snap between a few preset widths.
5. Close the panel with the **×** button or by pressing **Escape**.
6. Opening a preview is itself logged as a "Viewed" event in the audit trail.

### Organizing documents into folders

1. Click **+ New Folder** in the top bar (Admin/Compliance Officer only).
2. Give it a name and pick a default security classification for anything placed inside.
3. The folder appears immediately in both the left-hand folder tree and the main file list.
4. Click into a folder from either the tree or the main list to navigate into it — the breadcrumb trail at the top of the page updates to show your current path, and you can click any earlier crumb (including **Home**) to jump back.
5. Switch between **Grid view** (cards) and **Table view** (dense rows with a select-all checkbox) using the toggle in the toolbar — your current folder and any selected files stay the same when you switch.

> There is currently no drag-to-move or copy feature — moving a document into a different folder means deleting it and re-uploading it there.

### Setting or changing a document's sensitivity

1. Open the file's context menu (the **⋮** icon on a card, or the action icons in a table row).
2. Choose to edit the document, or open it and use the classification control.
3. Pick the new level: Confidential, Restricted, Internal Only, or Public. The colored badge on the file updates everywhere instantly.
4. This change is recorded in the audit trail automatically.

### Reviewing and adding a compliance flag

1. Open a document's preview panel and switch to the **Compliance** tab.
2. Click **+ Add Flag** (Admin/Compliance Officer only).
3. Describe which section or clause is a concern (e.g. "Clause 4.2 — Material Exposure"), pick a severity (High, Medium, or Low), and explain why.
4. Click **Save Flag**. It immediately appears in the flag list, and — if the wording you entered matches text in the document — the matching line in the document itself is highlighted in red (High) or amber (Medium) with a **Flagged** badge you can click for details. (Highlighting only works for text-based documents, and only when your description text is found in the document — it's a simple text match, not guaranteed to catch every phrasing.)
5. Anyone with view access can see flags in the Compliance tab, including Advisors and Auditors — they just can't add or resolve them.
6. To resolve a flag once it's been addressed, click **Resolve Flag** next to it (or open its details popup and click **Mark Resolved**). This removes the flag permanently and logs the resolution.

### Checking the audit trail

1. Click **Audit Trail** in the top bar — a panel slides in from the right showing a chronological timeline of activity.
2. Every entry shows what happened, which document it was, who did it (name and role), and when — with both a friendly "2 minutes ago" style timestamp and the exact date/time on hover.
3. Use the action chips at the top (Uploaded, Viewed, Downloaded, Flagged, Permission Changed, Deleted) to narrow the list to one kind of event, and the role dropdown to narrow it to one type of user.
4. The trail records: uploads, folder creation, document views, downloads, renames, sensitivity/permission changes, compliance flags being added or resolved, and deletions.
5. A couple of things it does **not** currently catch: bulk ("select multiple and delete") deletions don't produce individual log entries, and simply streaming/opening a raw file link doesn't log a view the way clicking to preview it does. If precise, complete records matter for a specific document, treat the trail as a strong but not perfectly exhaustive record.

### Running batch actions on multiple documents

1. In either Grid or Table view, click the selection checkbox on two or more files (in Table view, there's also a select-all checkbox in the header).
2. A floating action bar appears at the bottom of the screen showing how many items are selected.
3. From there you can **Set Sensitivity** to reclassify every selected item at once, or **Delete All** to remove them all together (with a confirmation prompt first, warning you if any selected item is a folder with contents inside).
4. Click the **×** on the action bar at any time to clear your selection without doing anything.

---

## 4. Common Tasks — Quick Reference

| I want to... | How |
| :--- | :--- |
| Upload a document | Click **Upload** → pick classification → drag in files → **Upload File(s)** |
| Create a folder | Click **+ New Folder** → name it → pick classification → **Create Folder** |
| Preview a document | Click its card or row — opens instantly, nothing downloads |
| Download a document | Open its **⋮** menu or the download icon — only works if your role has been granted Share rights on that specific file |
| Change sensitivity | Open the file, use the classification control, pick a new level |
| Flag a compliance concern | Open the document → **Compliance** tab → **+ Add Flag** |
| Resolve a flag | Compliance tab → **Resolve Flag**, or click the flag's popup → **Mark Resolved** |
| See who did what and when | Click **Audit Trail** in the top bar |
| Give a role more/less access to one document | Open the document → **Access & RBAC** tab → **Edit Matrix** (Admin/Compliance Officer only) |
| Select and act on several files at once | Check 2+ selection boxes → use the floating bar at the bottom of the screen |
| Search for a document | Type in the search bar at the top — results filter as you type, across all folders |
| Filter by sensitivity or file type | Use the sensitivity pills and file-type dropdown in the toolbar just below the breadcrumb bar |
| Switch light/dark mode | Sun/moon icon in the top bar |

---

## 5. FAQ / Troubleshooting

**Why is a button greyed out?**
Your current role doesn't have permission for that action on that item. Hover over the greyed-out button — a tooltip explains exactly why (e.g. "Auditors have read-only access"). Ask an Admin or Compliance Officer to grant the specific permission if you believe you should have it.

**I'm an Advisor/Auditor and I can't download a file I can see.**
This is expected by default — Advisors and Auditors start with view-only access to every document. An Admin or Compliance Officer needs to open that specific document's **Access & RBAC** tab and grant your role Share rights before the Download button becomes active for it.

**A document I flagged doesn't show a highlighted line in the text.**
Highlighting only appears when the exact wording you typed in the flag's "Section or Line Reference" field can be found in the document's own text. The flag itself is still saved and visible in the Compliance tab regardless — the highlight is a convenience, not the source of truth.

**I deleted a folder — did I lose everything inside it?**
Yes, deleting a folder permanently removes everything nested inside it, including its stored files. The confirmation dialog warns you about this before you commit — read it carefully, especially for folders with a lot of contents. There's no undo.

**Another user uploaded a file but I don't see it yet.**
The workspace doesn't currently push live updates to everyone automatically. Navigate to a different folder and back, or refresh the page, to pick up other users' recent changes.

**I moved between roles using the switcher — did that log me in as someone else?**
No — the role switcher in this environment is a way to preview what each role sees and can do; it isn't a real sign-in. There are no individual login accounts yet, so treat any action taken while "switched" to a role as visible and attributable the same way any other action is (it's still recorded in the audit trail under that role's name).

**Why did an upload get rejected?**
Files larger than 50MB are blocked automatically with a warning. If a file is under that size and still fails, check your connection and try again — there's currently no automatic retry, so you'll need to re-add the file to the upload queue yourself.

**Can I move a file from one folder to another?**
Not directly yet. The current workaround is to delete it from its current location and re-upload it into the destination folder.

**Where do I see storage usage or system health?**
The left sidebar shows a storage indicator near the bottom, for general awareness. For anything beyond that, contact your Admin.
