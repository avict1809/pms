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