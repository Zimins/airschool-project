-- Create study_materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_study_materials_category ON public.study_materials(category);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_at ON public.study_materials(created_at DESC);

-- Disable RLS for this table
ALTER TABLE public.study_materials DISABLE ROW LEVEL SECURITY;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_study_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_study_materials_updated_at
  BEFORE UPDATE ON public.study_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_study_materials_updated_at();