# 🚀 Project Management System (PMS) - Development Plan

## 📋 Overview

This document outlines the step-by-step development approach for implementing the Project Management System (PMS) based on the requirements specified in `CONTEXT.md`. The plan is organized into phases, with each phase containing detailed tasks that can be implemented modularly.

---

## 🎯 Phase 1: Project Setup & Foundation (Week 1)

### 1.1 Environment Setup & Dependencies

- [ ] **Install and configure Supabase**

  - Set up Supabase project
  - Configure environment variables
  - Install Supabase client: `npm install @supabase/supabase-js`
  - Create `.env.local` with Supabase URL and anon key

- [ ] **Install UI and styling dependencies**

  - Install ShadCN UI: `npx shadcn@latest init`
  - Install additional UI components: `npx shadcn@latest add button card input form table dialog dropdown-menu avatar badge`
  - Install Lucide React for icons: `npm install lucide-react`
  - Install React Hook Form: `npm install react-hook-form @hookform/resolvers`
  - Install Zod for validation: `npm install zod`

- [ ] **Install additional utilities**
  - Install date-fns for date handling: `npm install date-fns`
  - Install React Query for data fetching: `npm install @tanstack/react-query`
  - Install React Hot Toast for notifications: `npm install react-hot-toast`

### 1.2 Database Schema Design

- [ ] **Create Supabase database tables**

  - `users` table (id, email, password_hash, role, display_name, created_at, is_active, is_first_login, password_set_at)
  - `projects` table (id, title, description, status, created_at, updated_at, admin_id, supervisor_id)
  - `project_members` table (id, project_id, user_id, role, joined_at)
  - `tasks` table (id, project_id, title, description, status, assigned_to, due_date, created_at, updated_at)
  - `files` table (id, project_id, uploaded_by, filename, file_path, file_size, uploaded_at)
  - `proposals` table (id, title, description, proposed_by, status, admin_comment, created_at, updated_at)
  - `announcements` table (id, title, content, posted_by, target_type, target_id, created_at)
  - `approval_requests` table (id, project_id, requested_by, request_type, description, status, admin_comment, created_at)
  - `financial_records` table (id, project_id, amount, description, type, recorded_by, created_at)
  - `tool_requests` table (id, project_id, requested_by, tool_name, description, status, approved_by, created_at)

- [ ] **Set up Row Level Security (RLS) policies**
  - Admin can access all data
  - Supervisors can access assigned projects and related data
  - Students can access their own projects and data

### 1.3 Authentication System

- [ ] **Create authentication utilities**

  - Create `lib/auth.ts` with Supabase auth functions
  - Implement sign in, sign out functions
  - Create first-time password setup system
  - Implement password reset functionality for existing users
  - Create user activation status checking

- [ ] **Create authentication components**

  - `components/auth/SignInForm.tsx` - Login form for existing users
  - `components/auth/FirstTimePasswordSetup.tsx` - Password setup for new users
  - `components/auth/ForgotPasswordForm.tsx` - Password reset for existing users
  - `components/auth/UserActivationCheck.tsx` - Check if user is activated

- [ ] **Set up authentication middleware**
  - Create `middleware.ts` for route protection
  - Implement role-based route guards
  - Create auth context provider
  - Implement first-time login detection and redirection

---

## 🎯 Phase 2: Core Infrastructure (Week 2)

### 2.1 Layout & Navigation System

- [ ] **Create base layout components**

  - `components/layout/AppLayout.tsx` - Main application layout
  - `components/layout/Sidebar.tsx` - Navigation sidebar
  - `components/layout/Header.tsx` - Top header with user info
  - `components/layout/Footer.tsx` - Application footer

- [ ] **Implement role-based navigation**
  - Create navigation config for each role (Admin, Supervisor, Student)
  - Implement dynamic sidebar based on user role
  - Create breadcrumb component for navigation

### 2.2 State Management & Data Fetching

- [ ] **Set up React Query**

  - Configure React Query provider
  - Create custom hooks for data fetching
  - Implement optimistic updates

- [ ] **Create API utilities**
  - `lib/api.ts` - Centralized API functions
  - `lib/database.ts` - Database helper functions
  - `lib/storage.ts` - File upload utilities

### 2.3 Error Handling & Loading States

- [ ] **Create error boundary components**

  - `components/ui/ErrorBoundary.tsx`
  - `components/ui/LoadingSpinner.tsx`
  - `components/ui/EmptyState.tsx`

- [ ] **Implement global error handling**
  - Create error toast notifications
  - Implement retry mechanisms
  - Create fallback UI components

---

## 🎯 Phase 3: User Management System (Week 3)

### 3.1 Admin User Management

- [ ] **Create admin dashboard**

  - `app/admin/page.tsx` - Main admin dashboard
  - Display total users, projects, statistics
  - Create dashboard cards and charts
  - Show pending tool requests and approval requests

- [ ] **User management interface**

  - `app/admin/users/page.tsx` - User list page
  - `components/admin/UserList.tsx` - User table component with activation status
  - `components/admin/AddUserForm.tsx` - Add user form (creates inactive user)
  - `components/admin/EditUserForm.tsx` - Edit user form (role, activation status)
  - `components/admin/BulkUploadUsers.tsx` - CSV upload component for bulk registration
  - `components/admin/UserActivationManager.tsx` - Manage user activation status

- [ ] **User operations**
  - Implement admin user registration (no email verification required)
  - Create first-time login flow where users set their password
  - Implement password reset functionality for existing users
  - Implement user deletion and role changes
  - Create bulk user import from CSV
  - Create user activation/deactivation system

### 3.2 Profile Management

- [ ] **Create profile pages**

  - `app/profile/page.tsx` - User profile page
  - `components/profile/ProfileForm.tsx` - Profile edit form
  - `components/profile/PasswordChangeForm.tsx` - Password change form

- [ ] **Profile functionality**
  - Display user information
  - Allow profile updates
  - Implement password changes
  - Show user statistics and contributions

---

## 🎯 Phase 4: Project Management System (Week 4-5)

### 4.1 Project Creation & Management

- [ ] **Project proposal system (Students)**

  - `app/propose/page.tsx` - Project proposal form
  - `components/projects/ProposalForm.tsx` - Proposal creation form
  - `components/projects/ProposalList.tsx` - List of user's proposals

- [ ] **Project approval system (Admin)**

  - `app/admin/proposals/page.tsx` - Admin proposals page
  - `components/admin/ProposalReview.tsx` - Proposal review component
  - `components/admin/ProposalActions.tsx` - Accept/deny actions

- [ ] **Project creation (Admin)**
  - `app/admin/projects/create/page.tsx` - Create project page
  - `components/admin/CreateProjectForm.tsx` - Project creation form
  - `components/admin/AssignMembers.tsx` - Member assignment component

### 4.2 Project Dashboard

- [ ] **Universal project dashboard**

  - `app/projects/[id]/page.tsx` - Dynamic project page
  - `components/projects/ProjectHeader.tsx` - Project title and status
  - `components/projects/ProjectStats.tsx` - Project statistics
  - `components/projects/ProjectProgress.tsx` - Progress indicators

- [ ] **Project navigation tabs**
  - Dashboard overview
  - Files management
  - Tasks management
  - Members management
  - Settings (admin only)
  - Approval requests

### 4.3 Project Files Management

- [ ] **Dynamic file upload system**

  - `components/projects/files/FileUpload.tsx` - Dynamic file upload component
  - `components/projects/files/FileList.tsx` - Dynamic file listing with real-time updates
  - `components/projects/files/FileViewer.tsx` - File preview component
  - `components/projects/files/FileGrid.tsx` - Grid view for files
  - `components/projects/files/FileTable.tsx` - Table view for files

- [ ] **Dynamic file operations**
  - Implement real-time file upload with progress indicators
  - Create dynamic file listing that updates automatically
  - Implement drag-and-drop upload with visual feedback
  - Create file preview functionality for common file types
  - Implement file deletion with confirmation (with permissions)
  - Add dynamic file search and filtering
  - Implement file sorting by name, size, date, type
  - Add file download functionality with progress tracking

---

## 🎯 Phase 5: Task Management System (Week 6)

### 5.1 Task Creation & Management

- [ ] **Task interface**

  - `app/projects/[id]/tasks/page.tsx` - Tasks list page
  - `components/tasks/TaskList.tsx` - Task listing component
  - `components/tasks/TaskCard.tsx` - Individual task card
  - `components/tasks/CreateTaskForm.tsx` - Task creation form

- [ ] **Task operations**
  - Create new tasks
  - Assign tasks to team members
  - Update task status (Todo, In Progress, Completed)
  - Set due dates and priorities
  - Add task descriptions and comments

### 5.2 Task Details & Comments

- [ ] **Individual task pages**

  - `app/projects/[id]/tasks/[taskId]/page.tsx` - Task detail page
  - `components/tasks/TaskDetails.tsx` - Task information display
  - `components/tasks/TaskComments.tsx` - Comment system
  - `components/tasks/TaskActions.tsx` - Task action buttons

- [ ] **Comment system**
  - Allow supervisors to comment on tasks
  - Implement comment threading
  - Add comment notifications

---

## 🎯 Phase 6: Financial Management (Week 7)

### 6.1 Financial Tracking

- [ ] **Financial dashboard**

  - `app/projects/[id]/finance/page.tsx` - Project finance page
  - `components/finance/FinanceOverview.tsx` - Financial summary
  - `components/finance/ExpenseList.tsx` - Expense tracking
  - `components/finance/IncomeList.tsx` - Income tracking

- [ ] **Financial operations**
  - Add income and expense records
  - Categorize financial entries
  - Generate financial reports
  - Calculate project budgets

### 6.2 Admin Financial Overview

- [ ] **System-wide financial management**
  - `app/admin/finance/page.tsx` - Admin finance dashboard
  - `components/admin/SystemFinance.tsx` - Overall financial view
  - `components/admin/ProjectFinanceComparison.tsx` - Project comparisons

---

## 🎯 Phase 7: Communication & Notifications (Week 8)

### 7.1 Announcement System

- [ ] **Announcement management (Admin)**

  - `app/admin/announcements/page.tsx` - Announcement management
  - `components/admin/CreateAnnouncement.tsx` - Create announcements
  - `components/admin/AnnouncementList.tsx` - Manage existing announcements
  - `components/admin/AnnouncementAnalytics.tsx` - View announcement engagement

- [ ] **Announcement display (All Users)**
  - `components/announcements/AnnouncementCard.tsx` - Display announcements
  - `components/announcements/AnnouncementFeed.tsx` - Announcement feed
  - `components/announcements/StudentAnnouncements.tsx` - Student-specific announcements
  - `components/announcements/SupervisorAnnouncements.tsx` - Supervisor-specific announcements
  - `components/announcements/ProjectAnnouncements.tsx` - Project-specific announcements
  - Implement global, project-specific, and user-specific announcements

### 7.2 Approval Request System

- [ ] **Request creation (Students & Supervisors)**

  - `components/requests/CreateRequest.tsx` - Create approval requests
  - `components/requests/RequestForm.tsx` - Request form component
  - `components/requests/StudentRequestList.tsx` - List student's own requests
  - `components/requests/SupervisorRequestList.tsx` - List supervisor's requests

- [ ] **Request management (Admin)**
  - `app/admin/requests/page.tsx` - Admin request management
  - `components/admin/RequestReview.tsx` - Review and approve/deny requests
  - `components/admin/RequestAnalytics.tsx` - Analytics on request types and status
  - `components/admin/RequestHistory.tsx` - View all request history

### 7.3 Tool Approval System

- [ ] **Tool request system (Students)**

  - `components/tools/ToolRequestForm.tsx` - Submit tool requests
  - `components/tools/StudentToolList.tsx` - List student's own tool requests
  - `components/tools/ToolRequestStatus.tsx` - Show request status and feedback

- [ ] **Tool approval system (Supervisors)**

  - `components/tools/SupervisorToolList.tsx` - List all tool requests for assigned projects
  - `components/tools/ToolApprovalForm.tsx` - Approve/deny tool requests with comments
  - `components/tools/ToolApprovalHistory.tsx` - View approval history

- [ ] **Tool management system (Admin)**
  - `components/tools/AdminToolList.tsx` - View all tool requests across all projects
  - `components/tools/ToolAnalytics.tsx` - Analytics on tool requests and approvals
  - `components/tools/ToolEligibilityManager.tsx` - Mark tools as eligible/ineligible

---

## 🎯 Phase 8: Advanced Features (Week 9)

### 8.1 Search & Filtering

- [ ] **Global search**

  - `components/search/GlobalSearch.tsx` - Search across projects, tasks, files
  - Implement search suggestions
  - Add search filters and sorting

- [ ] **Advanced filtering**
  - Filter projects by status, date, supervisor
  - Filter tasks by assignee, status, priority
  - Filter files by type, uploader, date

### 8.2 Reporting & Analytics

- [ ] **Project reports**

  - `components/reports/ProjectReport.tsx` - Generate project reports
  - `components/reports/UserReport.tsx` - Generate user contribution reports
  - Export reports to PDF/Excel

- [ ] **Analytics dashboard**
  - `components/analytics/ProjectAnalytics.tsx` - Project performance metrics
  - `components/analytics/UserAnalytics.tsx` - User activity analytics
  - Create charts and graphs for data visualization

### 8.3 PWA Features

- [ ] **Progressive Web App setup**
  - Configure PWA manifest
  - Implement service worker for offline functionality
  - Add app installation prompts
  - Enable offline data caching

---

## 🎯 Phase 9: Testing & Optimization (Week 10)

### 9.1 Testing Implementation

- [ ] **Unit testing**

  - Test individual components
  - Test utility functions
  - Test API endpoints

- [ ] **Integration testing**
  - Test user workflows
  - Test role-based access
  - Test data persistence

### 9.2 Performance Optimization

- [ ] **Code optimization**

  - Implement code splitting
  - Optimize bundle size
  - Add lazy loading for components

- [ ] **Database optimization**
  - Optimize database queries
  - Implement proper indexing
  - Add query caching

### 9.3 Security Hardening

- [ ] **Security measures**
  - Implement proper input validation
  - Add CSRF protection
  - Secure file uploads
  - Implement rate limiting

---

## 🎯 Phase 10: Deployment & Documentation (Week 11-12)

### 10.1 Deployment Preparation

- [ ] **Environment setup**

  - Configure production environment variables
  - Set up CI/CD pipeline
  - Configure domain and SSL

- [ ] **Database migration**
  - Create production database
  - Run migration scripts
  - Seed initial data

### 10.2 Documentation

- [ ] **User documentation**

  - Create user guides for each role
  - Add in-app help tooltips
  - Create video tutorials

- [ ] **Technical documentation**
  - API documentation
  - Database schema documentation
  - Deployment guide

### 10.3 Final Testing & Launch

- [ ] **User acceptance testing**

  - Test with real users
  - Gather feedback
  - Fix critical issues

- [ ] **Production launch**
  - Deploy to production
  - Monitor system performance
  - Handle user onboarding

---

## 📊 Development Timeline Summary

| Phase     | Duration   | Key Deliverables                                 |
| --------- | ---------- | ------------------------------------------------ |
| Phase 1   | Week 1     | Project setup, dependencies, database schema     |
| Phase 2   | Week 2     | Core infrastructure, layouts, state management   |
| Phase 3   | Week 3     | User management, authentication, profiles        |
| Phase 4-5 | Week 4-5   | Project management, file system, task management |
| Phase 6   | Week 7     | Financial tracking and reporting                 |
| Phase 7   | Week 8     | Communication, announcements, approvals          |
| Phase 8   | Week 9     | Advanced features, search, analytics             |
| Phase 9   | Week 10    | Testing, optimization, security                  |
| Phase 10  | Week 11-12 | Deployment, documentation, launch                |

---

## 🎯 Success Criteria

### Functional Requirements

- [ ] All three user roles (Admin, Supervisor, Student) can access their designated features
- [ ] Project lifecycle from proposal to completion is fully functional
- [ ] File upload and management system works correctly
- [ ] Task management with comments and status updates
- [ ] Financial tracking and reporting
- [ ] Announcement and approval request systems
- [ ] Role-based access control is properly enforced

### Technical Requirements

- [ ] Application is responsive and works on mobile devices
- [ ] PWA features enable offline functionality
- [ ] Performance is optimized for smooth user experience
- [ ] Security measures protect user data and prevent unauthorized access
- [ ] Database queries are optimized and efficient
- [ ] Error handling provides clear feedback to users

### User Experience Requirements

- [ ] Intuitive navigation and user interface
- [ ] Clear feedback for all user actions
- [ ] Fast loading times and responsive interactions
- [ ] Accessible design following WCAG guidelines
- [ ] Comprehensive help and documentation

---

## 📝 Notes for Development

1. **Modular Development**: Each task should be developed as a separate, testable module
2. **Role-Based Testing**: Test each feature with all relevant user roles
3. **Mobile-First**: Design and develop with mobile devices in mind
4. **Security First**: Implement security measures from the beginning
5. **Performance**: Monitor and optimize performance throughout development
6. **Documentation**: Document code and create user guides as you develop

This development plan provides a comprehensive roadmap for building the Project Management System. Each phase builds upon the previous one, ensuring a solid foundation and systematic approach to development.

---

## 📁 Complete Project File Structure

```
pms/
├── app/                                    # Next.js App Router
│   ├── (auth)/                            # Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx                   # Login page
│   │   ├── first-time-setup/
│   │   │   └── page.tsx                   # First-time password setup
│   │   ├── forgot-password/
│   │   │   └── page.tsx                   # Password reset
│   │   └── layout.tsx                     # Auth layout
│   │
│   ├── admin/                             # Admin routes
│   │   ├── page.tsx                       # Admin dashboard
│   │   ├── users/
│   │   │   ├── page.tsx                   # User management
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Edit user
│   │   ├── projects/
│   │   │   ├── page.tsx                   # All projects
│   │   │   └── create/
│   │   │       └── page.tsx               # Create project
│   │   ├── proposals/
│   │   │   ├── page.tsx                   # Project proposals
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Review proposal
│   │   ├── announcements/
│   │   │   ├── page.tsx                   # Announcement management
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Edit announcement
│   │   ├── requests/
│   │   │   ├── page.tsx                   # Approval requests
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Review request
│   │   ├── tools/
│   │   │   └── page.tsx                   # Tool management
│   │   └── finance/
│   │       └── page.tsx                   # System finance
│   │
│   ├── supervisor/                        # Supervisor routes
│   │   ├── page.tsx                       # Supervisor dashboard
│   │   ├── projects/
│   │   │   └── page.tsx                   # Assigned projects
│   │   └── requests/
│   │       └── page.tsx                   # Approval requests
│   │
│   ├── student/                           # Student routes
│   │   ├── page.tsx                       # Student dashboard
│   │   └── propose/
│   │       └── page.tsx                   # Propose project
│   │
│   ├── projects/                          # Project routes (universal)
│   │   ├── page.tsx                       # Projects list
│   │   └── [id]/                          # Dynamic project routes
│   │       ├── page.tsx                   # Project dashboard
│   │       ├── files/
│   │       │   └── page.tsx               # Project files
│   │       ├── tasks/
│   │       │   ├── page.tsx               # Project tasks
│   │       │   └── [taskId]/
│   │       │       └── page.tsx           # Task details
│   │       ├── members/
│   │       │   └── page.tsx               # Project members
│   │       ├── finance/
│   │       │   └── page.tsx               # Project finance
│   │       ├── tools/
│   │       │   └── page.tsx               # Project tools
│   │       ├── settings/
│   │       │   └── page.tsx               # Project settings
│   │       └── requests/
│   │           └── page.tsx               # Project requests
│   │
│   ├── profile/                           # Profile routes
│   │   └── page.tsx                       # User profile
│   │
│   ├── announcements/                     # Announcement routes
│   │   └── page.tsx                       # Announcements feed
│   │
│   ├── globals.css                        # Global styles
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Landing page
│   └── not-found.tsx                      # 404 page
│
├── components/                            # React components
│   ├── ui/                                # Base UI components (ShadCN)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── error-boundary.tsx
│   │   └── empty-state.tsx
│   │
│   ├── layout/                            # Layout components
│   │   ├── AppLayout.tsx                  # Main app layout
│   │   ├── Sidebar.tsx                    # Navigation sidebar
│   │   ├── Header.tsx                     # Top header
│   │   ├── Footer.tsx                     # App footer
│   │   └── Breadcrumb.tsx                 # Navigation breadcrumbs
│   │
│   ├── auth/                              # Authentication components
│   │   ├── SignInForm.tsx                 # Login form
│   │   ├── FirstTimePasswordSetup.tsx     # First-time password setup
│   │   ├── ForgotPasswordForm.tsx         # Password reset form
│   │   └── UserActivationCheck.tsx        # User activation check
│   │
│   ├── admin/                             # Admin-specific components
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.tsx         # Admin dashboard
│   │   │   ├── StatsCards.tsx             # Statistics cards
│   │   │   └── Charts.tsx                 # Dashboard charts
│   │   ├── users/
│   │   │   ├── UserList.tsx               # User table
│   │   │   ├── AddUserForm.tsx            # Add user form
│   │   │   ├── EditUserForm.tsx           # Edit user form
│   │   │   ├── BulkUploadUsers.tsx        # CSV upload
│   │   │   └── UserActivationManager.tsx  # User activation
│   │   ├── projects/
│   │   │   ├── CreateProjectForm.tsx      # Create project
│   │   │   ├── AssignMembers.tsx          # Assign members
│   │   │   └── ProjectList.tsx            # All projects
│   │   ├── proposals/
│   │   │   ├── ProposalReview.tsx         # Review proposals
│   │   │   └── ProposalActions.tsx        # Accept/deny actions
│   │   ├── announcements/
│   │   │   ├── CreateAnnouncement.tsx     # Create announcements
│   │   │   ├── AnnouncementList.tsx       # Manage announcements
│   │   │   └── AnnouncementAnalytics.tsx  # Announcement analytics
│   │   ├── requests/
│   │   │   ├── RequestReview.tsx          # Review requests
│   │   │   ├── RequestAnalytics.tsx       # Request analytics
│   │   │   └── RequestHistory.tsx         # Request history
│   │   ├── tools/
│   │   │   ├── AdminToolList.tsx          # All tool requests
│   │   │   ├── ToolAnalytics.tsx          # Tool analytics
│   │   │   └── ToolEligibilityManager.tsx # Tool eligibility
│   │   └── finance/
│   │       ├── SystemFinance.tsx          # System finance
│   │       └── ProjectFinanceComparison.tsx # Finance comparison
│   │
│   ├── supervisor/                        # Supervisor-specific components
│   │   ├── dashboard/
│   │   │   └── SupervisorDashboard.tsx    # Supervisor dashboard
│   │   ├── projects/
│   │   │   └── AssignedProjects.tsx       # Assigned projects
│   │   └── requests/
│   │       └── SupervisorRequestList.tsx  # Supervisor requests
│   │
│   ├── student/                           # Student-specific components
│   │   ├── dashboard/
│   │   │   └── StudentDashboard.tsx       # Student dashboard
│   │   └── projects/
│   │       ├── ProposalForm.tsx           # Project proposal
│   │       └── ProposalList.tsx           # User's proposals
│   │
│   ├── projects/                          # Project components (universal)
│   │   ├── ProjectHeader.tsx              # Project title/status
│   │   ├── ProjectStats.tsx               # Project statistics
│   │   ├── ProjectProgress.tsx            # Progress indicators
│   │   ├── ProjectTabs.tsx                # Navigation tabs
│   │   ├── files/
│   │   │   ├── FileUpload.tsx             # File upload
│   │   │   ├── FileList.tsx               # File listing
│   │   │   ├── FileViewer.tsx             # File preview
│   │   │   ├── FileGrid.tsx               # Grid view
│   │   │   └── FileTable.tsx              # Table view
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx               # Task listing
│   │   │   ├── TaskCard.tsx               # Task card
│   │   │   ├── CreateTaskForm.tsx         # Create task
│   │   │   ├── TaskDetails.tsx            # Task details
│   │   │   ├── TaskComments.tsx           # Task comments
│   │   │   └── TaskActions.tsx            # Task actions
│   │   ├── members/
│   │   │   ├── MemberList.tsx             # Member listing
│   │   │   ├── MemberCard.tsx             # Member card
│   │   │   └── AddMember.tsx              # Add member
│   │   ├── finance/
│   │   │   ├── FinanceOverview.tsx        # Financial summary
│   │   │   ├── ExpenseList.tsx            # Expense tracking
│   │   │   ├── IncomeList.tsx             # Income tracking
│   │   │   └── FinancialChart.tsx         # Financial charts
│   │   ├── settings/
│   │   │   ├── ProjectSettings.tsx        # Project settings
│   │   │   └── ArchiveProject.tsx         # Archive project
│   │   ├── tools/
│   │   │   ├── ToolRequestForm.tsx        # Submit tool request (Students)
│   │   │   ├── StudentToolList.tsx        # Student's tool requests
│   │   │   ├── ToolRequestStatus.tsx      # Request status (Students)
│   │   │   ├── SupervisorToolList.tsx     # Tool requests (Supervisors)
│   │   │   ├── ToolApprovalForm.tsx       # Approve/deny tools (Supervisors)
│   │   │   └── ToolApprovalHistory.tsx    # Approval history (Supervisors)
│   │   └── requests/
│   │       ├── CreateRequest.tsx          # Create request
│   │       ├── RequestForm.tsx            # Request form
│   │       └── RequestList.tsx            # Project requests
│   │
│   ├── profile/                           # Profile components
│   │   ├── ProfileForm.tsx                # Profile edit
│   │   ├── PasswordChangeForm.tsx         # Password change
│   │   └── UserStats.tsx                  # User statistics
│   │
│   ├── announcements/                     # Announcement components
│   │   ├── AnnouncementCard.tsx           # Announcement display
│   │   ├── AnnouncementFeed.tsx           # Announcement feed
│   │   ├── StudentAnnouncements.tsx       # Student announcements
│   │   ├── SupervisorAnnouncements.tsx    # Supervisor announcements
│   │   └── ProjectAnnouncements.tsx       # Project announcements
│   │
│   ├── requests/                          # Request components
│   │   ├── CreateRequest.tsx              # Create request
│   │   ├── RequestForm.tsx                # Request form
│   │   ├── StudentRequestList.tsx         # Student requests
│   │   └── SupervisorRequestList.tsx      # Supervisor requests
│   │
│   ├── tools/                             # Tool components (Admin only)
│   │   ├── AdminToolList.tsx              # Admin tool list
│   │   ├── ToolAnalytics.tsx              # Tool analytics
│   │   └── ToolEligibilityManager.tsx     # Tool eligibility
│   │
│   ├── search/                            # Search components
│   │   ├── GlobalSearch.tsx               # Global search
│   │   └── SearchFilters.tsx              # Search filters
│   │
│   └── reports/                           # Report components
│       ├── ProjectReport.tsx              # Project reports
│       ├── UserReport.tsx                 # User reports
│       ├── ProjectAnalytics.tsx           # Project analytics
│       └── UserAnalytics.tsx              # User analytics
│
├── lib/                                   # Utility libraries
│   ├── auth.ts                            # Authentication utilities
│   ├── api.ts                             # API functions
│   ├── database.ts                        # Database helpers
│   ├── storage.ts                         # File storage utilities
│   ├── utils.ts                           # General utilities
│   ├── validations.ts                     # Form validations
│   └── constants.ts                       # Application constants
│
├── hooks/                                 # Custom React hooks
│   ├── useAuth.ts                         # Authentication hook
│   ├── useProjects.ts                     # Projects hook
│   ├── useFiles.ts                        # Files hook
│   ├── useTasks.ts                        # Tasks hook
│   ├── useUsers.ts                        # Users hook
│   ├── useAnnouncements.ts                # Announcements hook
│   ├── useRequests.ts                     # Requests hook
│   └── useTools.ts                        # Tools hook
│
├── types/                                 # TypeScript type definitions
│   ├── auth.ts                            # Authentication types
│   ├── project.ts                         # Project types
│   ├── user.ts                            # User types
│   ├── file.ts                            # File types
│   ├── task.ts                            # Task types
│   ├── announcement.ts                    # Announcement types
│   ├── request.ts                         # Request types
│   └── tool.ts                            # Tool types
│
├── middleware.ts                          # Next.js middleware
├── next.config.ts                         # Next.js configuration
├── tailwind.config.ts                     # Tailwind CSS configuration
├── tsconfig.json                          # TypeScript configuration
├── package.json                           # Dependencies
├── .env.local                             # Environment variables
└── README.md                              # Project documentation
```

## 📊 Component Distribution by Feature

### 🔐 Authentication (4 components)

- SignInForm, FirstTimePasswordSetup, ForgotPasswordForm, UserActivationCheck

### 👨‍💼 Admin Features (25+ components)

- Dashboard, User Management, Project Management, Proposals, Announcements, Requests, Tools, Finance

### 👨‍🏫 Supervisor Features (5 components)

- Dashboard, Assigned Projects, Request Management

### 👨‍🎓 Student Features (5 components)

- Dashboard, Project Proposals

### 📁 Project Management (20+ components)

- Universal project components for files, tasks, members, finance, settings, requests

### 📢 Communication (5 components)

- Announcement system with role-specific displays

### 🛠 Tools (6 components)

- Tool request and approval system within projects (Students/Supervisors) + Admin management

### 📊 Analytics & Reports (4 components)

- Project and user analytics, reporting system

### 🔍 Search & Utilities (2 components)

- Global search and filtering capabilities

---

## 🎯 Key Architectural Decisions

1. **Role-Based Component Organization**: Components are organized by user role for clear separation of concerns
2. **Universal Project Components**: Project-related components are shared across all roles with permission-based rendering
3. **Modular File Structure**: Each feature has its own directory with related components
4. **Type Safety**: Comprehensive TypeScript types for all data structures
5. **Custom Hooks**: Reusable hooks for data fetching and state management
6. **Utility Libraries**: Centralized utilities for common operations

This file structure ensures scalability, maintainability, and clear separation of concerns while supporting the complex role-based functionality of the PMS system.

---

## 🗄️ Database Schema & Structure

### 📊 Database Overview

The PMS system uses **Supabase** as the backend database with **PostgreSQL** and includes comprehensive **Row Level Security (RLS)** policies for role-based access control.

### 🏗️ Database Tables

#### **1. USERS TABLE**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- NULL for admin-created users until first login
    role TEXT CHECK (role IN ('admin', 'supervisor', 'student')) NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    is_active BOOLEAN DEFAULT FALSE, -- Admin activates users
    is_first_login BOOLEAN DEFAULT TRUE, -- Track first-time login
    password_set_at TIMESTAMP WITH TIME ZONE, -- When user set their password
    created_by UUID REFERENCES users(id) ON DELETE SET NULL -- Track who created the user
);
```

**Purpose**: User accounts with role-based access control and first-time login tracking.

#### **2. PROJECTS TABLE**

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'active', 'completed', 'archived')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who created the project
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Assigned supervisor
    is_archived BOOLEAN DEFAULT FALSE
);
```

**Purpose**: Projects with status tracking, supervisor assignment, and lifecycle management.

#### **3. PROJECT_MEMBERS TABLE**

```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('student', 'supervisor', 'admin')) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(project_id, user_id) -- Prevent duplicate memberships
);
```

**Purpose**: Many-to-many relationship between users and projects with role tracking.

#### **4. PROJECT_PROPOSALS TABLE**

```sql
CREATE TABLE project_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    proposed_by UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
    admin_comment TEXT, -- Admin's feedback on proposal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);
```

**Purpose**: Student project proposals awaiting admin approval.

#### **5. TASKS TABLE**

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose**: Project tasks with assignment, priority, and status tracking.

#### **6. TASK_COMMENTS TABLE**

```sql
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

**Purpose**: Comments on tasks (supervisors can comment on student tasks).

#### **7. FILES TABLE**

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase storage path
    file_size BIGINT,
    file_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

**Purpose**: Project files with metadata and Supabase storage integration.

#### **8. ANNOUNCEMENTS TABLE**

```sql
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type TEXT CHECK (target_type IN ('global', 'project', 'student', 'supervisor')) NOT NULL,
    target_id UUID, -- Can reference projects(id) or users(id) depending on target_type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

**Purpose**: System announcements with target filtering (global, project-specific, role-specific).

#### **9. FINANCIAL_RECORDS TABLE**

```sql
CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT, -- e.g., 'equipment', 'software', 'travel', etc.
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    date DATE DEFAULT current_date
);
```

**Purpose**: Project financial tracking with income/expense categorization.

#### **10. APPROVAL_REQUESTS TABLE**

```sql
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    request_type TEXT CHECK (request_type IN ('tool', 'document', 'budget', 'timeline', 'other')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
    admin_comment TEXT, -- Admin's response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose**: General approval requests for projects (budget, timeline, etc.).

#### **11. TOOL_REQUESTS TABLE**

```sql
CREATE TABLE tool_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    tool_name TEXT NOT NULL,
    description TEXT,
    justification TEXT, -- Why the tool is needed
    status TEXT CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
    supervisor_comment TEXT, -- Supervisor's feedback
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL -- Supervisor who responded
);
```

**Purpose**: Project-specific tool requests and supervisor approval workflow.

#### **12. SYSTEM_SUGGESTIONS TABLE**

```sql
CREATE TABLE system_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT CHECK (category IN ('feature', 'improvement', 'bug', 'other')) DEFAULT 'improvement',
    status TEXT CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected')) DEFAULT 'pending',
    admin_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);
```

**Purpose**: Student suggestions for system improvements and admin review.

### 🔐 Row Level Security (RLS) Policies

#### **Access Control Matrix**

| Table              | Admin             | Supervisor                   | Student                      |
| ------------------ | ----------------- | ---------------------------- | ---------------------------- |
| users              | Full access       | Own profile only             | Own profile only             |
| projects           | All projects      | Assigned projects            | Member projects              |
| project_members    | All members       | Project members              | Project members              |
| project_proposals  | All proposals     | None                         | Own proposals                |
| tasks              | All tasks         | Project tasks                | Project tasks                |
| task_comments      | All comments      | Project comments             | Project comments             |
| files              | All files         | Project files                | Project files                |
| announcements      | All announcements | Role + project announcements | Role + project announcements |
| financial_records  | All records       | Project records              | Project records              |
| approval_requests  | All requests      | Project requests             | Own requests                 |
| tool_requests      | All requests      | Project requests             | Own requests                 |
| system_suggestions | All suggestions   | None                         | Own suggestions              |

#### **Key RLS Policies**

1. **User Management**: Only admins can create, update, and view all users
2. **Project Access**: Users can only access projects they're members of
3. **Supervisor Oversight**: Supervisors can manage their assigned projects
4. **Student Limitations**: Students can only access their own data and project data
5. **Admin Override**: Admins have full access to all data

### 📈 Performance Optimizations

#### **Indexes**

- **Primary keys**: UUID with gen_random_uuid()
- **Foreign keys**: Indexed for join performance
- **Status fields**: Indexed for filtering
- **Date fields**: Indexed for sorting and filtering
- **Composite indexes**: For complex queries

#### **Key Indexes**

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Projects
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_supervisor ON projects(supervisor_id);

-- Project members
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- Tasks
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Files
CREATE INDEX idx_files_project ON files(project_id);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at);

-- Announcements
CREATE INDEX idx_announcements_target ON announcements(target_type, target_id);

-- Financial records
CREATE INDEX idx_financial_records_project ON financial_records(project_id);
CREATE INDEX idx_financial_records_type ON financial_records(type);
```

### 🔄 Automation & Triggers

#### **Updated At Triggers**

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 🚀 Database Setup

#### **Initial Setup**

1. Execute the complete SQL script in `database/db.sql`
2. The script will:
   - Drop existing tables (if any)
   - Create all new tables with proper relationships
   - Set up RLS policies
   - Create performance indexes
   - Set up automation triggers
   - Insert default admin user

#### **Default Admin User**

```sql
INSERT INTO users (email, role, display_name, is_active, is_first_login)
VALUES ('admin@pms.com', 'admin', 'System Administrator', TRUE, TRUE);
```

### 📊 Data Relationships

#### **Entity Relationship Diagram (ERD)**

```
users (1) ←→ (many) project_members (many) ←→ (1) projects
projects (1) ←→ (many) tasks
projects (1) ←→ (many) files
projects (1) ←→ (many) financial_records
projects (1) ←→ (many) approval_requests
projects (1) ←→ (many) tool_requests
users (1) ←→ (many) project_proposals
users (1) ←→ (many) system_suggestions
tasks (1) ←→ (many) task_comments
```

### 🔧 Database Maintenance

#### **Regular Tasks**

1. **Backup**: Daily automated backups via Supabase
2. **Monitoring**: Query performance monitoring
3. **Index Maintenance**: Regular index analysis and optimization
4. **Data Archiving**: Archive old projects and inactive users
5. **Security Audits**: Regular RLS policy reviews

This database schema provides a robust foundation for the PMS system with proper security, performance, and scalability considerations.

---

## 🗂️ Supabase Folder Structure

The `supabase/` directory centralizes all Supabase-related configuration, context, and database management for best practices and maintainability.

```
supabase/
├── client.ts        # Supabase client initialization (singleton pattern)
├── context.ts       # React context/provider for Supabase client and session
├── db.sql           # Main database schema and migration scripts
├── policies.sql     # RLS and security policy scripts (versioned)
└── README.md        # Supabase setup and usage documentation
```

### 📄 File Purposes

- **client.ts**: Exports a configured Supabase client for use throughout the app. Ensures a single instance and easy import.
- **context.ts**: Provides a React context and provider for Supabase session/auth state, making it accessible in the component tree.
- **db.sql**: Contains the full database schema, migrations, and triggers. Should be version-controlled and used for reproducible environments.
- **policies.sql**: Contains all Row Level Security (RLS) and access control policies, separated for clarity and versioning.
- **README.md**: Explains how to set up, migrate, and use Supabase in this project, including environment variables and best practices.

> **Best Practice:** Keep all Supabase logic, migrations, and context in this folder to ensure clear separation from application logic and easy onboarding for new developers.
