-- Ensure flight_schools table has all required contact columns
-- This migration is idempotent and safe to run multiple times

-- Add contact_email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'flight_schools'
    AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE public.flight_schools
    ADD COLUMN contact_email VARCHAR(255);

    -- Add email validation constraint
    ALTER TABLE public.flight_schools
    ADD CONSTRAINT valid_email CHECK (contact_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' OR contact_email IS NULL);
  END IF;
END $$;

-- Add contact_phone if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'flight_schools'
    AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE public.flight_schools
    ADD COLUMN contact_phone VARCHAR(50);
  END IF;
END $$;

-- Add contact_website if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'flight_schools'
    AND column_name = 'contact_website'
  ) THEN
    ALTER TABLE public.flight_schools
    ADD COLUMN contact_website VARCHAR(255);
  END IF;
END $$;

-- Add contact_address if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'flight_schools'
    AND column_name = 'contact_address'
  ) THEN
    ALTER TABLE public.flight_schools
    ADD COLUMN contact_address TEXT;
  END IF;
END $$;

-- Add image_url if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'flight_schools'
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.flight_schools
    ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';