-- Fix Proposal Schema Issues
-- Run this in your Supabase SQL editor

-- 1. Add team_members column to project_proposals table (if it doesn't exist)
-- Note: We need to drop and recreate if it exists with wrong type
DO $$ 
BEGIN
    -- Check if team_members column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'project_proposals' 
        AND column_name = 'team_members'
    ) THEN
        -- Drop the column if it exists with wrong type
        ALTER TABLE project_proposals DROP COLUMN team_members;
    END IF;
END $$;

-- Add team_members column with correct UUID[] type
ALTER TABLE project_proposals 
ADD COLUMN team_members UUID[] DEFAULT '{}';

-- 2. Add proposal_id column to projects table to link back to original proposal
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS proposal_id UUID REFERENCES project_proposals(id);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_proposals_team_members ON project_proposals USING GIN (team_members);
CREATE INDEX IF NOT EXISTS idx_projects_proposal_id ON projects(proposal_id);

-- 4. Update existing RLS policies for project_proposals to include team_members
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own proposals" ON project_proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON project_proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON project_proposals;
DROP POLICY IF EXISTS "Admins can view all proposals" ON project_proposals;
DROP POLICY IF EXISTS "Admins can update all proposals" ON project_proposals;

-- Recreate policies with updated column references
CREATE POLICY "Users can view their own proposals" ON project_proposals
    FOR SELECT USING (
        auth.uid() = proposed_by
        OR
        auth.uid() = ANY(team_members)
        OR
        auth.uid() = proposed_supervisor_id
        OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'supervisor'
        )
    );

CREATE POLICY "Users can create proposals" ON project_proposals
    FOR INSERT WITH CHECK (
        auth.uid() = proposed_by
        AND
        (team_members IS NULL OR auth.uid() = ANY(team_members))
    );

CREATE POLICY "Users can update their own proposals" ON project_proposals
    FOR UPDATE USING (
        auth.uid() = proposed_by
        AND
        status = 'draft'
    );

CREATE POLICY "Admins can view all proposals" ON project_proposals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all proposals" ON project_proposals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Update existing RLS policies for projects to use project_members table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view projects they're part of" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects they created" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;

-- Recreate policies with updated references
CREATE POLICY "Users can view projects they're part of" ON projects
    FOR SELECT USING (
        auth.uid() = created_by
        OR
        auth.uid() = supervisor_id
        OR
        EXISTS (
            SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'supervisor'
        )
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (
        auth.uid() = created_by
        OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update projects they created" ON projects
    FOR UPDATE USING (
        auth.uid() = created_by
        OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all projects" ON projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Grant necessary permissions
GRANT ALL ON project_members TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 