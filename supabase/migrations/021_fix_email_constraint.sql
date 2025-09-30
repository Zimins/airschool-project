-- Fix email constraint to allow empty strings and NULL values
-- Drop the existing constraint if it exists
ALTER TABLE public.flight_schools
DROP CONSTRAINT IF EXISTS valid_email;

-- Add new constraint that allows NULL, empty string, or valid email format
ALTER TABLE public.flight_schools
ADD CONSTRAINT valid_email CHECK (
  contact_email IS NULL
  OR contact_email = ''
  OR contact_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
);