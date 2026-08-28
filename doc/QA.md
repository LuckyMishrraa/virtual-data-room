# Project Clarifications & Questions / Answers (Q&A)

---

### **Q1:** The task mentions that S3/serverless storage is out of scope, but as you mentioned I need to work with backend using FastAPI. Which database should I use for the FastAPI backend? How much of the backend is expected for this task, and how should the file/document data be handled? Using FastAPI, are fully functional APIs expected for files, folders, permissions, file uploads, and audit logs?
**Answer:**  
Use **MinIO** for object/file storage (S3-compatible, self-hosted/local storage), along with a standard database for metadata and FastAPI backend APIs.

---

### **Q2:** Should authentication/login be implemented as part of this task, or should I work with the four mentioned roles — Admin, Compliance Officer, Advisor, and Auditor — as mock users?
**Answer:**  
First try to implement using mock data. Once the frontend is done, you can start the backend and integrate them, or if you like, you can start with an auth backend with roles — it's your choice how you want to do it. I prefer if you complete the frontend part with mock and then work on the backend and integrations.

---

### **Q3:** For file uploads, should the uploaded files actually be handled and stored through the backend, or is the drag-and-drop upload flow mainly required from the UI side?
**Answer:**  
It's both: for drag-and-drop you need to implement that in the frontend, and the upload should be from the backend APIs.

---

### **Q4:** For PDF and image previews, should I implement actual document rendering, or should I follow the mock renderer approach mentioned in the task?
**Answer:**  
For the viewer, come up with some simple solution; no need to complicate the implementation just for this functionality.

---

### **Q5:** Will there be a Figma or any existing design reference that I should follow, or should I design the VDR interface based on the requirements?
**Answer:**  
You should be figuring out and designing the layout and design on your own.

---

### **Q6:** For the permission system, should the View/Edit/Share permissions actually restrict the actions available to different roles, or is updating and displaying the permission state enough?
**Answer:**  
Permissions functionality can be implemented pretty easily.

---

### **Q7:** For the audit trail, should activities such as Uploaded, Viewed, Downloaded, Flagged, Renamed, and Permission Changed be generated automatically whenever those actions happen?
**Answer:**  
You can implement the logs for the actions, but I don't want you to focus more on the backend part — this you can ignore or keep it as least priority.

---

### **Q8:** Should the audit logs also be connected to the FastAPI backend so that the activity history is maintained there?
**Answer:**  
Yes, it should be if you decide to implement it.

---

### **Q9:** For the Next.js structure, should I use the App Router? Also, are there any specific routes/pages that you want me to follow for the VDR?
**Answer:**  
Next.js basic structure would do.

---

### **Q10:** Since proper branching is required for each feature, is there a specific branching strategy or naming convention that the team follows?
**Answer:**  
Use the standard one for features; should be like `feature/feature-name`.

---

### **Q11:** Should I create separate feature branches for things like the file explorer, document preview, permissions, audit logs, and FastAPI backend, and then raise PRs for them?
**Answer:**  
Yes, that is how it should be.

---

### **Q12:** Is there any specific commit message format or PR convention that I should follow?
**Answer:**  
Use the standard approaches for them (not one-liners, but standard descriptive format).

---

### **Q13:** For the GitHub repository, should I use the provided office github for creating repository and for creating branches, committing, and pushing the code, and handle those Git operations manually as mentioned?
**Answer:**  
Yes.

---

### **Q14:** Regarding Claude Code, should I use it mainly for implementation, debugging, refactoring, and code assistance while handling the Git operations manually?
**Answer:**  
Yes, use Claude for everything, but be cautious — it hallucinates a lot, so go step-by-step and check everything is as expected.

---

### **Q15:** Is there anything else in the existing repository or project structure that I should follow before starting the VDR implementation?
**Answer:**  
No, create a new repo for this.