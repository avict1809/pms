# 📘 Project Management System (PMS) – AI Context File

## 🚀 Overview

The **Project Management System (PMS)** is a progressive web application (PWA) aimed at improving project-based learning in schools. The platform supports three main user roles:

- **Admin**
- **Supervisor**
- **Student**

Each unit has a dedicated set of responsibilities, privileges, and UI flows. The application is being built using modern web technologies and AI assistance.

---

## 🧑‍💼 Admin Unit

### ✅ Privileges and Responsibilities

- Register students, supervisors, and fellow admins.
- Accept or deny project proposals (with comments).
- View overall progress of all projects.
- Assign supervisors to specific projects.
- Post announcements (global/project-specific/student-specific).
- View files uploaded by any project or individual.
- View summaries of:
  - Projects by task completion.
  - Individual student contributions.
- Upload documents (global or per project).
- Start a new project and assign team members.
- View financial details:
  - Per project
  - Overall system-wide
- Bulk student registration via CSV upload.
- Mark uploaded tools (by students/supervisors) as eligible or not.

### 🧭 Navigation Flow

#### 1. **Dashboard**
- Displays:
  - Total users
  - Total projects
  - Projects in-progress
  - Projects completed
  - Relevant graphs and statistics

#### 2. **Projects**
- List of all registered projects.
- Ability to click and open individual project dashboards (dynamic route: `/projects/:id`).

#### 3. **Proposals**
- View all pending project proposals.
- Accept or deny each with optional comments.
- Uses dynamic route per proposal.

#### 4. **Users**
- Add, delete, or reset passwords.
- Bulk upload users (via CSV).
- Each added user receives a **verification email valid for 1 week**.
- Verified users land on password setup screen.

#### 5. **Finance**
- View, analyze, and regulate all financial data across all projects.

#### 6. **Profile Settings**
- Update display name, password, and other credentials.

---

## 👨‍🏫 Supervisor Unit

### ✅ Privileges and Responsibilities

- Oversee assigned projects only.
- Comment on completed tasks and milestones.
- Submit requests for admin approval.
- Approve tools submitted by students.
- Upload documents to project.
- View project summaries and financials of their own projects.

### 🧭 Navigation Flow

- **Dashboard** (Only their assigned projects)
- **Projects List**
- **Notifications / Announcements**
- **Profile Settings**
- **Individual Project Dashboard** (`/projects/:id`)
  - View/manage tasks, files, members, project progress
  - Submit approval requests
  - Add/update project documents

---

## 👨‍🎓 Student Unit

### ✅ Privileges and Responsibilities

- Propose new projects.
- Upload project documents/files.
- Submit tool requirements.
- Submit suggestions for improving the system/curriculum.
- View individual contribution summaries.
- View each project's summary from the project dashboard.

### 🧭 Navigation Flow

- **Dashboard** (List of their projects)
- **Propose Project** button
- **Profile Progress**
- **Notifications / Announcements**
- **Profile Settings**
- **Project View** (`/projects/:id`)
  - Upload files
  - Track project and personal progress
  - Submit approval requests

---

## 📁 Project Management Unit (`/projects/:projectId`)

This section is **universal** and used by **admin, supervisor, and student**, with different access levels.

### 📌 Modules Within Project Page

1. **Dashboard**
   - Summary of progress
   - Financials
   - Project status and metrics

2. **Files**
   - Upload files
   - View all related documents

3. **Tasks**
   - View all tasks
   - Each task links to a detailed page (`/projects/:id/tasks/:taskId`)

4. **Members**
   - List all project participants
   - Manage or view roles (depending on permission)

5. **Settings**
   - Project-level settings (admin-only)
   - Archive or modify project metadata

6. **Approval Requests**
   - View/send approval requests
   - Admin sees all and responds with decision + comment

---

## 📲 Authentication & Onboarding Flow

- All users sign up via **email + password**.
- New users must verify their email within **1 week**.
- Upon verification, users are redirected to set their password.
- Admin adds users manually or via CSV, triggering the email flow.

---

## 🛠 Tech Stack

| Technology     | Purpose                                 |
|----------------|------------------------------------------|
| Next.js        | Frontend framework & routing             |
| Supabase       | Backend-as-a-Service (auth, DB, storage) |
| ShadCN UI      | UI components library                    |
| Reanimated     | Animations (if needed)                   |
| Tailwind CSS   | Styling                                  |
| PWA Support    | Offline-capable, installable web app     |

---

## 🔐 Permissions Matrix

| Feature                        | Admin | Supervisor | Student |
|-------------------------------|-------|------------|---------|
| View/Manage All Projects      | ✅    | ❌         | ❌      |
| View Assigned Projects        | ✅    | ✅         | ✅      |
| Upload Project Files          | ✅    | ✅         | ✅      |
| Manage Tasks                  | ✅    | ✅         | ✅      |
| View Finances                 | ✅    | ✅         | ❌      |
| Propose New Project           | ❌    | ❌         | ✅      |
| Comment on Tasks              | ❌    | ✅         | ❌      |
| Approve Tool List             | ❌    | ✅         | ❌      |
| Announcements (Post)          | ✅    | ❌         | ❌      |
| Announcements (View)          | ✅    | ✅         | ✅      |
| Submit Approval Requests      | ❌    | ✅         | ✅      |
| Approve Requests              | ✅    | ❌         | ❌      |
| System Suggestions            | ❌    | ❌         | ✅      |

---

## 📎 Notes

- **Dynamic Routing** is used heavily, especially for project-level and task-level pages.
- **Role-Based Access Control (RBAC)** must be enforced at both frontend and backend.
- **Progressive Web App (PWA)** functionality is crucial — should be installable and work offline for basic viewing.

---

## 📌 To-Do (Future Scope Ideas)

- AI Summaries for student performance and suggestions
- Chat interface for team communication
- Notifications with real-time updates
- Integrate calendar and deadline tracker
- Export data and reports to PDF/Excel

---

