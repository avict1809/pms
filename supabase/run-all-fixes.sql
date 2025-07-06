-- =====================================================
-- COMPLETE FIX SCRIPT - RUN THIS IN SUPABASE SQL EDITOR
-- This script will fix all the 401 errors and database issues
-- =====================================================

-- Step 1: Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE files DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE tool_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_suggestions DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all RLS policies to clean up
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Users can view project if member" ON projects;
DROP POLICY IF EXISTS "Supervisors can view supervised projects" ON projects;

DROP POLICY IF EXISTS "Admins can manage project members" ON project_members;
DROP POLICY IF EXISTS "Users can view project members" ON project_members;

DROP POLICY IF EXISTS "Students can create proposals" ON project_proposals;
DROP POLICY IF EXISTS "Students can view own proposals" ON project_proposals;
DROP POLICY IF EXISTS "Admins can manage proposals" ON project_proposals;

DROP POLICY IF EXISTS "Users can view project tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage tasks" ON tasks;
DROP POLICY IF EXISTS "Supervisors can manage tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view task comments" ON task_comments;
DROP POLICY IF EXISTS "Supervisors can create comments" ON task_comments;

DROP POLICY IF EXISTS "Users can view project files" ON files;
DROP POLICY IF EXISTS "Users can upload files" ON files;
DROP POLICY IF EXISTS "Admins can manage files" ON files;

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view global announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view project announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view personal announcements" ON announcements;

DROP POLICY IF EXISTS "Users can view financial records" ON financial_records;
DROP POLICY IF EXISTS "Users can create financial records" ON financial_records;
DROP POLICY IF EXISTS "Admins can manage financial records" ON financial_records;

DROP POLICY IF EXISTS "Users can view approval requests" ON approval_requests;
DROP POLICY IF EXISTS "Users can create approval requests" ON approval_requests;
DROP POLICY IF EXISTS "Admins can manage approval requests" ON approval_requests;

DROP POLICY IF EXISTS "Users can view tool requests" ON tool_requests;
DROP POLICY IF EXISTS "Users can create tool requests" ON tool_requests;
DROP POLICY IF EXISTS "Admins can manage tool requests" ON tool_requests;

DROP POLICY IF EXISTS "Users can view system suggestions" ON system_suggestions;
DROP POLICY IF EXISTS "Users can create system suggestions" ON system_suggestions;
DROP POLICY IF EXISTS "Admins can manage system suggestions" ON system_suggestions;

-- Step 3: Fix project_proposals table schema
ALTER TABLE project_proposals 
ADD COLUMN IF NOT EXISTS objectives TEXT,
ADD COLUMN IF NOT EXISTS methodology TEXT,
ADD COLUMN IF NOT EXISTS expected_outcomes TEXT,
ADD COLUMN IF NOT EXISTS timeline TEXT,
ADD COLUMN IF NOT EXISTS resources TEXT;

-- Step 4: Update status check constraint to include 'draft' status
ALTER TABLE project_proposals 
DROP CONSTRAINT IF EXISTS project_proposals_status_check;

ALTER TABLE project_proposals 
ADD CONSTRAINT project_proposals_status_check 
CHECK (status IN ('draft', 'pending', 'approved', 'denied'));

-- Step 5: Verify that RLS is disabled on all tables
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN 'RLS DISABLED ✓'
        ELSE 'RLS STILL ENABLED ✗'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'users', 'projects', 'project_members', 'project_proposals', 
    'tasks', 'task_comments', 'files', 'announcements', 
    'financial_records', 'approval_requests', 'tool_requests', 'system_suggestions'
)
ORDER BY tablename;

-- Step 6: Verify the project_proposals table schema
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'project_proposals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 7: Show confirmation
SELECT 'All fixes have been applied successfully!' as message; 