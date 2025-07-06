-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE, -- Whether this setting is visible to non-admin users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
-- General Settings
('site_name', 'Project Management System', 'string', 'Name of the application', 'general', true),
('site_description', 'A comprehensive project management system for educational institutions', 'string', 'Description of the application', 'general', true),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'general', false),
('maintenance_message', 'System is under maintenance. Please try again later.', 'string', 'Message shown during maintenance', 'general', true),

-- User Management Settings
('user_registration_enabled', 'false', 'boolean', 'Allow new user registrations', 'users', false),
('email_verification_required', 'true', 'boolean', 'Require email verification for new users', 'users', false),
('max_login_attempts', '5', 'number', 'Maximum login attempts before lockout', 'users', false),
('session_timeout_minutes', '480', 'number', 'Session timeout in minutes (8 hours)', 'users', false),

-- Project Settings
('max_projects_per_user', '10', 'number', 'Maximum number of projects a user can create', 'projects', false),
('project_approval_required', 'true', 'boolean', 'Require admin approval for new projects', 'projects', false),
('file_upload_limit_mb', '50', 'number', 'Maximum file upload size in MB', 'projects', false),
('allowed_file_types', '["pdf", "doc", "docx", "txt", "jpg", "png", "gif", "zip", "rar"]', 'json', 'Allowed file types for upload', 'projects', false),

-- Notification Settings
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', 'notifications', false),
('push_notifications_enabled', 'true', 'boolean', 'Enable push notifications', 'notifications', false),
('notification_retention_days', '30', 'number', 'Days to keep notifications', 'notifications', false),

-- Security Settings
('password_min_length', '8', 'number', 'Minimum password length', 'security', false),
('password_require_special_chars', 'true', 'boolean', 'Require special characters in passwords', 'security', false),
('two_factor_auth_enabled', 'false', 'boolean', 'Enable two-factor authentication', 'security', false),
('session_timeout_enabled', 'true', 'boolean', 'Enable automatic session timeout', 'security', false),

-- Backup Settings
('auto_backup_enabled', 'true', 'boolean', 'Enable automatic database backups', 'backup', false),
('backup_frequency_hours', '24', 'number', 'Backup frequency in hours', 'backup', false),
('backup_retention_days', '30', 'number', 'Days to keep backups', 'backup', false),

-- Analytics Settings
('analytics_enabled', 'true', 'boolean', 'Enable system analytics', 'analytics', false),
('data_retention_days', '365', 'number', 'Days to keep analytics data', 'analytics', false),
('privacy_mode_enabled', 'false', 'boolean', 'Enable privacy mode (anonymize data)', 'analytics', false)

ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_system_settings_updated_at(); 