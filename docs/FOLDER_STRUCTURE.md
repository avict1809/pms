# 📁 Project Folder Structure (with Improvements)

This structure is based on the development plan, with improvements for industry best practices and a dedicated `supabase/` folder for context/configuration.

```
pms/
├── app/                                    # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/                            # Authentication routes
│   │   ├── login/
│   │   │   └── page.tsx                   # Login page
│   │   ├── first-time-setup/
│   │   │   └── page.tsx                   # First-time password setup
│   │   ├── forgot-password/
│   │   │   └── page.tsx                   # Password reset
│   │   └── layout.tsx                     # Auth layout
│   │
│   ├── admin/                             # Admin routes
│   │   ├── page.tsx                       # Admin dashboard
│   │   ├── users/
│   │   │   ├── page.tsx                   # User management
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Edit user
│   │   ├── projects/
│   │   │   ├── page.tsx                   # All projects
│   │   │   └── create/
│   │   │       └── page.tsx               # Create project
│   │   ├── proposals/
│   │   │   ├── page.tsx                   # Project proposals
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Review proposal
│   │   ├── announcements/
│   │   │   ├── page.tsx                   # Announcement management
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Edit announcement
│   │   ├── requests/
│   │   │   ├── page.tsx                   # Approval requests
│   │   │   └── [id]/
│   │   │       └── page.tsx               # Review request
│   │   ├── tools/
│   │   │   └── page.tsx                   # Tool management
│   │   └── finance/
│   │       └── page.tsx                   # System finance
│   │
│   ├── supervisor/                        # Supervisor routes
│   │   ├── page.tsx                       # Supervisor dashboard
│   │   ├── projects/
│   │   │   └── page.tsx                   # Assigned projects
│   │   └── requests/
│   │       └── page.tsx                   # Approval requests
│   │
│   ├── student/                           # Student routes
│   │   ├── page.tsx                       # Student dashboard
│   │   └── propose/
│   │       └── page.tsx                   # Propose project
│   │
│   ├── projects/                          # Project routes (universal)
│   │   ├── page.tsx                       # Projects list
│   │   └── [id]/                          # Dynamic project routes
│   │       ├── page.tsx                   # Project dashboard
│   │       ├── files/
│   │       │   └── page.tsx               # Project files
│   │       ├── tasks/
│   │       │   ├── page.tsx               # Project tasks
│   │       │   └── [taskId]/
│   │       │       └── page.tsx           # Task details
│   │       ├── members/
│   │       │   └── page.tsx               # Project members
│   │       ├── finance/
│   │       │   └── page.tsx               # Project finance
│   │       ├── tools/
│   │       │   └── page.tsx               # Project tools
│   │       ├── settings/
│   │       │   └── page.tsx               # Project settings
│   │       └── requests/
│   │           └── page.tsx               # Project requests
│   │
│   ├── profile/                           # Profile routes
│   │   └── page.tsx                       # User profile
│   │
│   ├── announcements/                     # Announcement routes
│   │   └── page.tsx                       # Announcements feed
│   │
│   ├── globals.css                        # Global styles
│   ├── layout.tsx                         # Root layout
│   ├── page.tsx                           # Landing page
│   └── not-found.tsx                      # 404 page
│
├── components/                            # React components (feature-based, atomic design)
│   ├── ui/                                # Base UI components (ShadCN, atomic)
│   ├── layout/                            # Layout and navigation
│   ├── auth/                              # Authentication
│   ├── admin/                             # Admin-specific
│   ├── supervisor/                        # Supervisor-specific
│   ├── student/                           # Student-specific
│   ├── projects/                          # Universal project components
│   ├── profile/                           # User profile
│   ├── announcements/                     # Announcements
│   ├── requests/                          # Approval requests
│   ├── tools/                             # Tool management (admin only)
│   ├── search/                            # Search and filtering
│   └── reports/                           # Analytics and reporting
│
├── lib/                                   # Utility libraries (API, auth, db, storage, helpers)
├── hooks/                                 # Custom React hooks
├── types/                                 # TypeScript type definitions
├── middleware.ts                          # Next.js middleware (auth, RBAC)
├── supabase/                              # Supabase context, config, and SQL migrations
│   ├── client.ts                          # Supabase client initialization
│   ├── context.ts                         # Supabase context provider
│   ├── db.sql                             # Database schema and migrations
│   └── policies.sql                       # RLS and security policies
├── public/                                # Static assets (images, icons, manifest)
├── docs/                                  # Documentation (CONTEXT.md, DEVELOPMENT_PLAN.md, FOLDER_STRUCTURE.md)
├── .env.local                             # Environment variables (never commit)
├── next.config.ts                         # Next.js configuration
├── tailwind.config.ts                     # Tailwind CSS configuration
├── tsconfig.json                          # TypeScript configuration
├── package.json                           # Dependencies
└── README.md                              # Project documentation
```

## 🏆 Improvements & Best Practices

- **supabase/**: All Supabase context, client, and SQL scripts are grouped for clarity and separation of concerns.
- **components/**: Organized by feature and atomic design principles for scalability.
- **lib/**: Centralized utilities for API, authentication, and helpers.
- **hooks/**: Custom React hooks for data and state management.
- **types/**: All TypeScript types and interfaces.
- **docs/**: All documentation and planning files.
- **public/**: Static assets and manifest.
- **.env.local**: Environment variables (never committed to version control).
- **Separation of concerns**: Each directory has a clear, single responsibility.
- **Naming conventions**: Use kebab-case for files, PascalCase for components, and camelCase for variables/functions.
- **Atomic design**: UI components are reusable and composable.
- **Migration scripts**: All database and RLS policies are versioned in `supabase/`.
