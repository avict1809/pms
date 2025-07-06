-- =====================================================
-- COMPLETE RLS DISABLE SCRIPT
-- Run this in your Supabase SQL Editor
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

-- Step 2: Drop all existing RLS policies
-- Users policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Projects policies
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Users can view project if member" ON projects;
DROP POLICY IF EXISTS "Supervisors can view supervised projects" ON projects;

-- Project members policies
DROP POLICY IF EXISTS "Admins can manage project members" ON project_members;
DROP POLICY IF EXISTS "Users can view project members" ON project_members;

-- Project proposals policies
DROP POLICY IF EXISTS "Students can create proposals" ON project_proposals;
DROP POLICY IF EXISTS "Students can view own proposals" ON project_proposals;
DROP POLICY IF EXISTS "Admins can manage proposals" ON project_proposals;

-- Tasks policies
DROP POLICY IF EXISTS "Users can view project tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage tasks" ON tasks;
DROP POLICY IF EXISTS "Supervisors can manage tasks" ON tasks;

-- Task comments policies
DROP POLICY IF EXISTS "Users can view task comments" ON task_comments;
DROP POLICY IF EXISTS "Supervisors can create comments" ON task_comments;

-- Files policies
DROP POLICY IF EXISTS "Users can view project files" ON files;
DROP POLICY IF EXISTS "Users can upload files" ON files;
DROP POLICY IF EXISTS "Admins can manage files" ON files;

-- Announcements policies
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view global announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view project announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view personal announcements" ON announcements;

-- Financial records policies
DROP POLICY IF EXISTS "Users can view financial records" ON financial_records;
DROP POLICY IF EXISTS "Users can create financial records" ON financial_records;
DROP POLICY IF EXISTS "Admins can manage financial records" ON financial_records;

-- Approval requests policies
DROP POLICY IF EXISTS "Users can view approval requests" ON approval_requests;
DROP POLICY IF EXISTS "Users can create approval requests" ON approval_requests;
DROP POLICY IF EXISTS "Admins can manage approval requests" ON approval_requests;

-- Tool requests policies
DROP POLICY IF EXISTS "Users can view tool requests" ON tool_requests;
DROP POLICY IF EXISTS "Users can create tool requests" ON tool_requests;
DROP POLICY IF EXISTS "Admins can manage tool requests" ON tool_requests;

-- System suggestions policies
DROP POLICY IF EXISTS "Users can view system suggestions" ON system_suggestions;
DROP POLICY IF EXISTS "Users can create system suggestions" ON system_suggestions;
DROP POLICY IF EXISTS "Admins can manage system suggestions" ON system_suggestions;

-- Step 3: Verify RLS is disabled on all tables
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

-- Step 4: Show confirmation message
SELECT 'RLS has been successfully disabled on all tables!' as message; 