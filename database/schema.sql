-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  posted_by uuid,
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['global'::text, 'project'::text, 'student'::text, 'supervisor'::text])),
  target_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.users(id)
);
CREATE TABLE public.approval_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  requested_by uuid,
  request_type text NOT NULL CHECK (request_type = ANY (ARRAY['tool'::text, 'document'::text, 'budget'::text, 'timeline'::text, 'other'::text])),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text])),
  admin_comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  responded_at timestamp with time zone,
  responded_by uuid,
  CONSTRAINT approval_requests_pkey PRIMARY KEY (id),
  CONSTRAINT approval_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT approval_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id),
  CONSTRAINT approval_requests_responded_by_fkey FOREIGN KEY (responded_by) REFERENCES public.users(id)
);
CREATE TABLE public.files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  uploaded_by uuid,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  file_type text,
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
);
CREATE TABLE public.financial_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  amount numeric NOT NULL,
  description text,
  type text NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
  category text,
  recorded_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  date date DEFAULT CURRENT_DATE,
  CONSTRAINT financial_records_pkey PRIMARY KEY (id),
  CONSTRAINT financial_records_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT financial_records_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id)
);
CREATE TABLE public.project_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  user_id uuid,
  role text NOT NULL CHECK (role = ANY (ARRAY['student'::text, 'supervisor'::text, 'admin'::text])),
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT project_members_pkey PRIMARY KEY (id),
  CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.project_proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  proposed_by uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['draft'::text, 'pending'::text, 'approved'::text, 'denied'::text])),
  admin_comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  objectives text,
  methodology text,
  expected_outcomes text,
  timeline text,
  resources text,
  supervisor_id uuid,
  team_members ARRAY DEFAULT '{}'::uuid[],
  proposed_supervisor_id uuid,
  CONSTRAINT project_proposals_pkey PRIMARY KEY (id),
  CONSTRAINT project_proposals_proposed_by_fkey FOREIGN KEY (proposed_by) REFERENCES public.users(id),
  CONSTRAINT project_proposals_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id),
  CONSTRAINT project_proposals_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id),
  CONSTRAINT project_proposals_proposed_supervisor_id_fkey FOREIGN KEY (proposed_supervisor_id) REFERENCES public.users(id)
);
CREATE TABLE public.project_team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text CHECK (role = ANY (ARRAY['member'::text, 'creator'::text, 'supervisor'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_team_members_pkey PRIMARY KEY (id),
  CONSTRAINT project_team_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text, 'archived'::text])),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_by uuid,
  supervisor_id uuid,
  is_archived boolean DEFAULT false,
  proposal_id uuid,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT projects_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id),
  CONSTRAINT projects_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.project_proposals(id)
);
CREATE TABLE public.proposal_team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text CHECK (role = ANY (ARRAY['member'::text, 'leader'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT proposal_team_members_pkey PRIMARY KEY (id),
  CONSTRAINT proposal_team_members_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.project_proposals(id),
  CONSTRAINT proposal_team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  setting_type text DEFAULT 'string'::text CHECK (setting_type = ANY (ARRAY['string'::text, 'number'::text, 'boolean'::text, 'json'::text])),
  description text,
  category text DEFAULT 'general'::text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_by uuid,
  CONSTRAINT system_settings_pkey PRIMARY KEY (id),
  CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.system_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'improvement'::text CHECK (category = ANY (ARRAY['feature'::text, 'improvement'::text, 'bug'::text, 'other'::text])),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'implemented'::text, 'rejected'::text])),
  admin_comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  CONSTRAINT system_suggestions_pkey PRIMARY KEY (id),
  CONSTRAINT system_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT system_suggestions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id)
);
CREATE TABLE public.task_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT task_comments_pkey PRIMARY KEY (id),
  CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo'::text CHECK (status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'completed'::text])),
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  due_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  assigned_to uuid,
  created_by uuid,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.tool_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  requested_by uuid,
  tool_name text NOT NULL,
  description text,
  justification text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text])),
  supervisor_comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  responded_at timestamp with time zone,
  responded_by uuid,
  CONSTRAINT tool_requests_pkey PRIMARY KEY (id),
  CONSTRAINT tool_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT tool_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id),
  CONSTRAINT tool_requests_responded_by_fkey FOREIGN KEY (responded_by) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'supervisor'::text, 'student'::text])),
  display_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_active boolean DEFAULT false,
  is_first_login boolean DEFAULT true,
  password_set_at timestamp with time zone,
  created_by uuid,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);