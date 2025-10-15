-- Create a function to allow users to delete their own account
-- This function uses SECURITY DEFINER to run with elevated privileges

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();

  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's data from profiles table
  DELETE FROM profiles WHERE id = user_id;

  -- Delete user's reviews
  DELETE FROM reviews WHERE user_id = user_id;

  -- Delete user's posts
  DELETE FROM community_posts WHERE user_id = user_id;

  -- Delete the user from auth.users
  -- This requires SECURITY DEFINER to have permission
  DELETE FROM auth.users WHERE id = user_id;

  -- Log the deletion
  RAISE NOTICE 'User % deleted successfully', user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account and all associated data';
