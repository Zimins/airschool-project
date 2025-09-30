-- Disable RLS for community_posts and community_comments tables
-- This allows admin dashboard and all users to access the data without RLS restrictions

-- Drop existing RLS policies for community_posts
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can create community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own community posts" ON public.community_posts;

-- Drop existing RLS policies for community_comments
DROP POLICY IF EXISTS "Anyone can view community comments" ON public.community_comments;
DROP POLICY IF EXISTS "Authenticated users can create community comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can delete their own community comments" ON public.community_comments;

-- Disable Row Level Security
ALTER TABLE public.community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments DISABLE ROW LEVEL SECURITY;