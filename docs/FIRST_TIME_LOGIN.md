# First-Time Login Flow

## Overview

The Project Management System (PMS) implements a secure first-time login flow for users who are created by administrators. This ensures that users can set their own passwords while maintaining security.

## How It Works

### 1. Admin Creates User

When an administrator creates a new user through the admin interface:

- User record is created in the `users` table
- `is_active` is set to `true` (or `false` if admin chooses to activate later)
- `is_first_login` is set to `true`
- No password is set in Supabase Auth initially

### 2. User Attempts First Login

When a user tries to log in for the first time:

1. User enters their email and any password
2. System checks if user exists in database and is active
3. System attempts to authenticate with Supabase Auth
4. If authentication fails (user doesn't exist in Auth), system shows first-time setup form

### 3. First-Time Password Setup

The user is presented with a secure password setup form:

- User enters and confirms their new password
- Password must be at least 8 characters long
- System creates user account in Supabase Auth
- Database is updated to mark first login as complete

### 4. Subsequent Logins

After first-time setup:

- User can log in normally with their email and password
- System redirects to appropriate dashboard based on role

## API Endpoints

### Check User Status

```
POST /api/auth/check-user
```

Checks if a user exists and is active in the database.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "User Name",
    "role": "student",
    "is_active": true,
    "is_first_login": true
  },
  "message": "User found"
}
```

### First-Time Setup

```
POST /api/auth/first-time-setup
```

Creates user account in Supabase Auth and updates database.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "newpassword123",
  "display_name": "User Name"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password set up successfully. You can now log in.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "User Name",
    "role": "student"
  }
}
```

## Database Schema

The `users` table includes these fields for first-time login tracking:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- NULL for admin-created users until first login
    role TEXT CHECK (role IN ('admin', 'supervisor', 'student')) NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    is_active BOOLEAN DEFAULT FALSE, -- Admin activates users
    is_first_login BOOLEAN DEFAULT TRUE, -- Track first-time login
    password_set_at TIMESTAMP WITH TIME ZONE, -- When user set their password
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);
```

## Security Features

1. **No Password Storage**: Admin-created users don't have passwords stored initially
2. **Secure Password Setup**: Users must set strong passwords (minimum 8 characters)
3. **Account Activation**: Only active accounts can set up passwords
4. **Audit Trail**: System tracks when passwords are set and by whom
5. **Email Verification**: Supabase handles email confirmation automatically

## User Experience

### For First-Time Users

1. Enter email and any password on login form
2. System detects first-time login and shows setup form
3. Enter and confirm new password
4. Account is created and user is redirected to login
5. Log in with new password

### For Regular Users

1. Enter email and password
2. System authenticates normally
3. User is redirected to appropriate dashboard

## Error Handling

The system handles various error scenarios:

- **User not found**: Clear error message
- **Account not activated**: Instructions to contact administrator
- **Password already set**: Redirect to normal login
- **Weak password**: Validation error with requirements
- **Network errors**: Generic error with retry option

## Testing

Use the test script to verify the flow:

```bash
node scripts/test-first-time-login.js
```

This script:

1. Creates a test user in the database
2. Tests the check-user API
3. Tests the first-time setup API
4. Verifies database updates
5. Tests login with new password
6. Cleans up test data

## Troubleshooting

### Common Issues

1. **"User not found" error**: Check if user exists in database and is active
2. **"Account not activated"**: Admin needs to activate the user account
3. **"Password already set"**: User has already completed first-time setup
4. **Authentication errors**: Check Supabase configuration and service keys

### Debug Steps

1. Check user record in database
2. Verify Supabase Auth configuration
3. Test API endpoints directly
4. Check browser console for errors
5. Verify environment variables are set correctly
