-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Experience', 'Tips', 'Question', 'Discussion')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0
);

-- Create comments table for community posts
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);

-- Disable RLS for easier access from admin dashboard and all users
ALTER TABLE public.community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments DISABLE ROW LEVEL SECURITY;