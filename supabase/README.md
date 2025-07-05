# Supabase Directory

This folder contains all Supabase-related configuration, context, and database management for the PMS project.

## Files

- `client.ts`: Supabase client initialization (singleton pattern)
- `context.tsx`: React context/provider for Supabase client and session
- `db.sql`: Main database schema and migration scripts
- `policies.sql`: RLS and security policy scripts (versioned)

## Setup

1. Add your Supabase credentials to `.env.local`:
   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
2. Use `client.ts` to access Supabase throughout the app.
3. Wrap your app in `SupabaseProvider` from `context.tsx` for session/auth state.
4. Run `db.sql` and `policies.sql` in the Supabase SQL editor to set up the database and RLS policies.

## Best Practices

- Keep all Supabase logic, migrations, and context in this folder.
- Version control your SQL scripts for reproducibility.
- Never commit `.env.local` or secrets.
- Use the context/provider for all auth/session-aware components.
