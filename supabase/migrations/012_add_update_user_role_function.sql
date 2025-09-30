-- Create a function to update user role in auth.users metadata
-- This allows us to promote users to admin role

-- Function to update user role by email
CREATE OR REPLACE FUNCTION update_user_role_by_email(
  user_email TEXT,
  new_role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with elevated privileges
AS $$
BEGIN
  -- Validate role
  IF new_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be either "user" or "admin"';
  END IF;

  -- Update the user's metadata
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', new_role)
  WHERE email = user_email;

  -- Check if user was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users (you may want to restrict this further)
GRANT EXECUTE ON FUNCTION update_user_role_by_email TO authenticated;

-- Example usage (commented out - uncomment and run to promote a user):
-- SELECT update_user_role_by_email('test@airschool.com', 'admin');