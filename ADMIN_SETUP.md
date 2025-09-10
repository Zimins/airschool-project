# AirSchool Admin Panel Setup Guide

## Overview
The admin panel allows authorized users to manage flight schools and study materials through a web interface.

## Features
- **Authentication**: Secure login system with role-based access control
- **Flight School Management**: Add, edit, and delete flight schools
- **Study Materials Management**: Create and manage educational content
- **Dashboard**: Overview of system statistics and recent activities

## Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Note down your project URL and anon key

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Database Migrations
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration script from `supabase/migrations/001_initial_schema.sql`

### 4. Create Admin User
1. Go to Authentication → Users in Supabase dashboard
2. Create a new user with email and password
3. Note the user's ID
4. Run this SQL query to add admin privileges:
```sql
INSERT INTO admin_users (id, email, role)
VALUES ('user-id-here', 'admin@example.com', 'admin');
```

## Running the Application

### Development
```bash
npm install
npm run web
```

### Access Admin Panel
1. Open the application in your browser
2. Click the shield icon in the header
3. Login with your admin credentials

## Admin Panel Navigation

### Dashboard
- View system statistics
- Recent activity log
- Quick action buttons

### Flight Schools Management
- View all flight schools
- Search and filter schools
- Edit school details
- Delete schools
- Add new schools

### Study Materials Management
- Browse study materials by category
- Add new educational content
- Edit existing materials
- Delete outdated content

## Security Notes
- Admin routes are protected with authentication
- Row Level Security (RLS) is enabled on all tables
- Only authenticated admins can modify data
- Public users have read-only access

## Database Schema

### Tables
- `flight_schools`: Flight school information
- `programs`: Training programs offered by schools
- `study_materials`: Educational content
- `admin_users`: Admin user access control

## Troubleshooting

### Cannot Login
- Verify user exists in Supabase Authentication
- Check if user is added to admin_users table
- Confirm environment variables are set correctly

### Data Not Loading
- Check Supabase connection
- Verify RLS policies are applied
- Check browser console for errors

### Changes Not Saving
- Ensure user has admin role
- Check network connection
- Verify Supabase project is active

## Support
For issues or questions, please check the project documentation or contact the development team.