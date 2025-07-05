-- PBLMS Project Management System Database Schema
-- This script modifies the existing database to match the new PMS requirements

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (if they exist)
-- =====================================================

DROP TABLE IF EXISTS tool_submissions CASCADE;
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS finances CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- USERS TABLE
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

-- PROJECTS TABLE
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

-- PROJECT MEMBERS TABLE
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('student', 'supervisor', 'admin')) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(project_id, user_id) -- Prevent duplicate memberships
);

-- PROJECT PROPOSALS TABLE (for student proposals)
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

-- TASKS TABLE
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

-- TASK COMMENTS TABLE
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- FILES TABLE
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

-- ANNOUNCEMENTS TABLE
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

-- FINANCIAL RECORDS TABLE
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

-- APPROVAL REQUESTS TABLE
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

-- TOOL REQUESTS TABLE (project-specific)
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

-- SYSTEM SUGGESTIONS TABLE
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

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Projects indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_supervisor ON projects(supervisor_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_archived ON projects(is_archived);

-- Project members indexes
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);

-- Project proposals indexes
CREATE INDEX idx_project_proposals_status ON project_proposals(status);
CREATE INDEX idx_project_proposals_proposed_by ON project_proposals(proposed_by);

-- Tasks indexes
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Task comments indexes
CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_comments_user ON task_comments(user_id);

-- Files indexes
CREATE INDEX idx_files_project ON files(project_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at);

-- Announcements indexes
CREATE INDEX idx_announcements_target ON announcements(target_type, target_id);
CREATE INDEX idx_announcements_posted_by ON announcements(posted_by);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

-- Financial records indexes
CREATE INDEX idx_financial_records_project ON financial_records(project_id);
CREATE INDEX idx_financial_records_type ON financial_records(type);
CREATE INDEX idx_financial_records_date ON financial_records(date);

-- Approval requests indexes
CREATE INDEX idx_approval_requests_project ON approval_requests(project_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_requested_by ON approval_requests(requested_by);

-- Tool requests indexes
CREATE INDEX idx_tool_requests_project ON tool_requests(project_id);
CREATE INDEX idx_tool_requests_status ON tool_requests(status);
CREATE INDEX idx_tool_requests_requested_by ON tool_requests(requested_by);

-- System suggestions indexes
CREATE INDEX idx_system_suggestions_user ON system_suggestions(user_id);
CREATE INDEX idx_system_suggestions_status ON system_suggestions(status);

 