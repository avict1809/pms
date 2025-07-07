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
    objectives TEXT,
    methodology TEXT,
    expected_outcomes TEXT,
    timeline TEXT,
    resources TEXT,
    proposed_by UUID REFERENCES users(id) ON DELETE CASCADE,
    proposed_supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'denied')) DEFAULT 'draft',
    admin_comment TEXT, -- Admin's feedback on proposal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- PROPOSAL TEAM MEMBERS TABLE
CREATE TABLE proposal_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES project_proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('student', 'supervisor')) NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(proposal_id, user_id) -- Prevent duplicate memberships
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
CREATE INDEX idx_project_proposals_supervisor ON project_proposals(proposed_supervisor_id);

-- Proposal team members indexes
CREATE INDEX idx_proposal_team_members_proposal ON proposal_team_members(proposal_id);
CREATE INDEX idx_proposal_team_members_user ON proposal_team_members(user_id);

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

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_suggestions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- USERS POLICIES
-- Admins can see all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Admins can insert users
CREATE POLICY "Admins can create users" ON users
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Admins can update users
CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role and activation status)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- PROJECTS POLICIES
-- Admins can see all projects
CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Admins can create projects
CREATE POLICY "Admins can create projects" ON projects
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Admins can update projects
CREATE POLICY "Admins can update projects" ON projects
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Users can see projects they're members of
CREATE POLICY "Users can view project if member" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = projects.id 
            AND user_id = auth.uid()
        )
    );

-- Supervisors can see projects they supervise
CREATE POLICY "Supervisors can view supervised projects" ON projects
    FOR SELECT USING (
        supervisor_id = auth.uid() 
        AND auth.jwt() ->> 'role' = 'supervisor'
    );

-- PROJECT MEMBERS POLICIES
-- Admins can manage all project members
CREATE POLICY "Admins can manage project members" ON project_members
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Users can see members of projects they're in
CREATE POLICY "Users can view project members" ON project_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm2
            WHERE pm2.project_id = project_members.project_id
            AND pm2.user_id = auth.uid()
        )
    );

-- PROJECT PROPOSALS POLICIES
-- Students can create proposals
CREATE POLICY "Students can create proposals" ON project_proposals
    FOR INSERT WITH CHECK (
        proposed_by = auth.uid() 
        AND auth.jwt() ->> 'role' = 'student'
    );

-- Students can view their own proposals
CREATE POLICY "Students can view own proposals" ON project_proposals
    FOR SELECT USING (
        proposed_by = auth.uid() 
        AND auth.jwt() ->> 'role' = 'student'
    );

-- Admins can view and manage all proposals
CREATE POLICY "Admins can manage proposals" ON project_proposals
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- TASKS POLICIES
-- Users can see tasks of projects they're members of
CREATE POLICY "Users can view project tasks" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = tasks.project_id 
            AND user_id = auth.uid()
        )
    );

-- Admins can manage all tasks
CREATE POLICY "Admins can manage tasks" ON tasks
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Supervisors can manage tasks in their projects
CREATE POLICY "Supervisors can manage tasks" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = tasks.project_id 
            AND supervisor_id = auth.uid()
        )
        AND auth.jwt() ->> 'role' = 'supervisor'
    );

-- TASK COMMENTS POLICIES
-- Users can see comments of tasks in their projects
CREATE POLICY "Users can view task comments" ON task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN project_members pm ON t.project_id = pm.project_id
            WHERE t.id = task_comments.task_id
            AND pm.user_id = auth.uid()
        )
    );

-- Supervisors can create comments
CREATE POLICY "Supervisors can create comments" ON task_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() 
        AND auth.jwt() ->> 'role' = 'supervisor'
    );

-- FILES POLICIES
-- Users can see files of projects they're members of
CREATE POLICY "Users can view project files" ON files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = files.project_id 
            AND user_id = auth.uid()
        )
    );

-- Users can upload files to projects they're members of
CREATE POLICY "Users can upload files" ON files
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = files.project_id 
            AND user_id = auth.uid()
        )
    );

-- Admins can manage all files
CREATE POLICY "Admins can manage files" ON files
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ANNOUNCEMENTS POLICIES
-- Admins can create and manage all announcements
CREATE POLICY "Admins can manage announcements" ON announcements
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Users can see global announcements
CREATE POLICY "Users can view global announcements" ON announcements
    FOR SELECT USING (target_type = 'global');

-- Users can see project announcements for their projects
CREATE POLICY "Users can view project announcements" ON announcements
    FOR SELECT USING (
        target_type = 'project'
        AND EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = target_id::uuid 
            AND user_id = auth.uid()
        )
    );

-- Users can see announcements targeted to them
CREATE POLICY "Users can view personal announcements" ON announcements
    FOR SELECT USING (
        target_type IN ('student', 'supervisor')
        AND target_id::uuid = auth.uid()
    );

-- FINANCIAL RECORDS POLICIES
-- Admins can see all financial records
CREATE POLICY "Admins can view all finances" ON financial_records
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Users can see finances of projects they're members of
CREATE POLICY "Users can view project finances" ON financial_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = financial_records.project_id 
            AND user_id = auth.uid()
        )
    );

-- Admins can manage all financial records
CREATE POLICY "Admins can manage finances" ON financial_records
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Supervisors can manage finances in their projects
CREATE POLICY "Supervisors can manage project finances" ON financial_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = financial_records.project_id 
            AND supervisor_id = auth.uid()
        )
        AND auth.jwt() ->> 'role' = 'supervisor'
    );

-- APPROVAL REQUESTS POLICIES
-- Users can create requests for projects they're members of
CREATE POLICY "Users can create requests" ON approval_requests
    FOR INSERT WITH CHECK (
        requested_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = approval_requests.project_id 
            AND user_id = auth.uid()
        )
    );

-- Users can view requests for projects they're members of
CREATE POLICY "Users can view project requests" ON approval_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = approval_requests.project_id 
            AND user_id = auth.uid()
        )
    );

-- Admins can manage all requests
CREATE POLICY "Admins can manage requests" ON approval_requests
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- TOOL REQUESTS POLICIES
-- Students can create tool requests for projects they're members of
CREATE POLICY "Students can create tool requests" ON tool_requests
    FOR INSERT WITH CHECK (
        requested_by = auth.uid()
        AND auth.jwt() ->> 'role' = 'student'
        AND EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_id = tool_requests.project_id 
            AND user_id = auth.uid()
        )
    );

-- Students can view their own tool requests
CREATE POLICY "Students can view own tool requests" ON tool_requests
    FOR SELECT USING (
        requested_by = auth.uid()
        AND auth.jwt() ->> 'role' = 'student'
    );

-- Supervisors can view and manage tool requests for their projects
CREATE POLICY "Supervisors can manage tool requests" ON tool_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = tool_requests.project_id 
            AND supervisor_id = auth.uid()
        )
        AND auth.jwt() ->> 'role' = 'supervisor'
    );

-- Admins can view all tool requests
CREATE POLICY "Admins can view all tool requests" ON tool_requests
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- SYSTEM SUGGESTIONS POLICIES
-- Students can create suggestions
CREATE POLICY "Students can create suggestions" ON system_suggestions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() 
        AND auth.jwt() ->> 'role' = 'student'
    );

-- Students can view their own suggestions
CREATE POLICY "Students can view own suggestions" ON system_suggestions
    FOR SELECT USING (
        user_id = auth.uid() 
        AND auth.jwt() ->> 'role' = 'student'
    );

-- Admins can view and manage all suggestions
CREATE POLICY "Admins can manage suggestions" ON system_suggestions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_proposals_updated_at BEFORE UPDATE ON project_proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT ADMIN USER
-- =====================================================

-- Insert a default admin user (password will be set during first login)
INSERT INTO users (email, role, display_name, is_active, is_first_login)
VALUES ('admin@pms.com', 'admin', 'System Administrator', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE projects IS 'Projects with status tracking and supervisor assignment';
COMMENT ON TABLE project_members IS 'Many-to-many relationship between users and projects';
COMMENT ON TABLE project_proposals IS 'Student project proposals awaiting admin approval';
COMMENT ON TABLE tasks IS 'Project tasks with assignment and status tracking';
COMMENT ON TABLE task_comments IS 'Comments on tasks (supervisors can comment)';
COMMENT ON TABLE files IS 'Project files with metadata and storage paths';
COMMENT ON TABLE announcements IS 'System announcements with target filtering';
COMMENT ON TABLE financial_records IS 'Project financial tracking (income/expense)';
COMMENT ON TABLE approval_requests IS 'General approval requests for projects';
COMMENT ON TABLE tool_requests IS 'Project-specific tool requests and approvals';
COMMENT ON TABLE system_suggestions IS 'Student suggestions for system improvements';

COMMENT ON COLUMN users.is_first_login IS 'Track if user needs to set password on first login';
COMMENT ON COLUMN users.is_active IS 'Admin-controlled user activation status';
COMMENT ON COLUMN projects.supervisor_id IS 'Assigned supervisor for project oversight';
COMMENT ON COLUMN announcements.target_type IS 'Type of target: global, project, student, supervisor';
COMMENT ON COLUMN tool_requests.responded_by IS 'Supervisor who approved/denied the tool request'; 