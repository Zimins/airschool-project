-- Create app_settings table for storing application configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings (needed for app name display)
CREATE POLICY "Anyone can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert default app name
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES
  ('app_name', 'PreflightSchool', 'The name of the application displayed throughout the site'),
  ('app_tagline', 'Start your flight dream', 'The tagline shown on login and signup pages')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update settings timestamp
CREATE OR REPLACE FUNCTION update_app_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for timestamp updates
CREATE TRIGGER update_app_settings_timestamp_trigger
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_timestamp();
