-- Proposal and Project Schema Modifications
-- Run these SQL commands in your Supabase SQL editor

-- 1. Add team_members and supervisor_id columns to project_proposals table
ALTER TABLE project_proposals 
ADD COLUMN IF NOT EXISTS team_members TEXT[] DEFAULT '{}';

-- Note: proposed_supervisor_id column already exists in the database schema

-- 2. Add proposal_id column to projects table to link back to original proposal
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS proposal_id UUID REFERENCES project_proposals(id);

-- 3. Create proposal_team_members table for detailed team member relationships
CREATE TABLE IF NOT EXISTS proposal_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES project_proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'leader')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

-- 4. Create project_team_members table for project team relationships
CREATE TABLE IF NOT EXISTS project_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'creator', 'supervisor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_proposals_team_members ON project_proposals USING GIN (team_members);
CREATE INDEX IF NOT EXISTS idx_project_proposals_supervisor_id ON project_proposals(proposed_supervisor_id);
CREATE INDEX IF NOT EXISTS idx_projects_proposal_id ON projects(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_team_members_proposal_id ON proposal_team_members(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_team_members_user_id ON proposal_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user_id ON project_team_members(user_id);

-- 6. Add RLS policies for proposal_team_members table
ALTER TABLE proposal_team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view team members for proposals they're part of or created
CREATE POLICY "Users can view proposal team members" ON proposal_team_members
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM proposal_team_members WHERE proposal_id = proposal_team_members.proposal_id
            UNION
            SELECT proposed_by FROM project_proposals WHERE id = proposal_team_members.proposal_id
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

-- Policy: Proposal creators can manage team members
CREATE POLICY "Proposal creators can manage team members" ON proposal_team_members
    FOR ALL USING (
        auth.uid() IN (
            SELECT proposed_by FROM project_proposals WHERE id = proposal_team_members.proposal_id
        )
    );

-- 7. Add RLS policies for project_team_members table
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view team members for projects they're part of
CREATE POLICY "Users can view project team members" ON project_team_members
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM project_team_members WHERE project_id = project_team_members.project_id
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

-- Policy: Project creators and admins can manage team members
CREATE POLICY "Project creators and admins can manage team members" ON project_team_members
    FOR ALL USING (
        auth.uid() IN (
            SELECT created_by FROM projects WHERE id = project_team_members.project_id
        )
        OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Update existing RLS policies for project_proposals to include new columns
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

-- 9. Update existing RLS policies for projects to include new columns
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view projects they're part of" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects they created" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;

-- Recreate policies with updated column references
CREATE POLICY "Users can view projects they're part of" ON projects
    FOR SELECT USING (
        auth.uid() = created_by
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

-- 10. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create triggers for updated_at columns
CREATE TRIGGER update_proposal_team_members_updated_at 
    BEFORE UPDATE ON proposal_team_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_team_members_updated_at 
    BEFORE UPDATE ON project_team_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Create function to sync team members from proposals to projects
CREATE OR REPLACE FUNCTION sync_proposal_team_to_project()
RETURNS TRIGGER AS $$
BEGIN
    -- If proposal is approved, create project team members
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Add proposal creator as project creator
        INSERT INTO project_team_members (project_id, user_id, role)
        VALUES (NEW.id, NEW.created_by, 'creator')
        ON CONFLICT (project_id, user_id) DO NOTHING;
        
        -- Add team members
        IF NEW.team_members IS NOT NULL AND array_length(NEW.team_members, 1) > 0 THEN
            INSERT INTO project_team_members (project_id, user_id, role)
            SELECT NEW.id, unnest(NEW.team_members), 'member'
            ON CONFLICT (project_id, user_id) DO NOTHING;
        END IF;
        
        -- Add supervisor if specified
        IF NEW.proposed_supervisor_id IS NOT NULL THEN
            INSERT INTO project_team_members (project_id, user_id, role)
            VALUES (NEW.id, NEW.proposed_supervisor_id, 'supervisor')
            ON CONFLICT (project_id, user_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Create trigger for automatic team member sync
CREATE TRIGGER sync_proposal_team_to_project_trigger
    AFTER UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION sync_proposal_team_to_project();

-- 14. Grant necessary permissions
GRANT ALL ON proposal_team_members TO authenticated;
GRANT ALL ON project_team_members TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 15. Create view for proposal statistics (optional)
CREATE OR REPLACE VIEW proposal_stats AS
SELECT 
    COUNT(*) as total_proposals,
    COUNT(*) FILTER (WHERE status = 'draft') as draft_proposals,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_proposals,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_proposals,
    COUNT(*) FILTER (WHERE status = 'denied') as denied_proposals,
    AVG(array_length(team_members, 1)) FILTER (WHERE team_members IS NOT NULL) as avg_team_size
FROM project_proposals;

-- Grant access to the view
GRANT SELECT ON proposal_stats TO authenticated; 