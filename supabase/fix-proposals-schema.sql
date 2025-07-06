-- =====================================================
-- FIX PROJECT_PROPOSALS TABLE SCHEMA
-- Add missing columns that the application expects
-- =====================================================

-- Add missing columns to project_proposals table
ALTER TABLE project_proposals 
ADD COLUMN IF NOT EXISTS objectives TEXT,
ADD COLUMN IF NOT EXISTS methodology TEXT,
ADD COLUMN IF NOT EXISTS expected_outcomes TEXT,
ADD COLUMN IF NOT EXISTS timeline TEXT,
ADD COLUMN IF NOT EXISTS resources TEXT;

-- Update status check constraint to include 'draft' status
ALTER TABLE project_proposals 
DROP CONSTRAINT IF EXISTS project_proposals_status_check;

ALTER TABLE project_proposals 
ADD CONSTRAINT project_proposals_status_check 
CHECK (status IN ('draft', 'pending', 'approved', 'denied'));

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'project_proposals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show confirmation
SELECT 'Project proposals table schema has been updated successfully!' as message; 