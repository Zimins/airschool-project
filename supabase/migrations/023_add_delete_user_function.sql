-- Create a function to allow users to delete their own account
-- This function uses SECURITY DEFINER to run with elevated privileges

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();

  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's data from profiles table
  DELETE FROM profiles WHERE id = current_user_id;

  -- Delete user's reviews
  DELETE FROM reviews WHERE reviews.user_id = current_user_id;

  -- Delete user's community comments (must be before posts due to foreign key)
  DELETE FROM community_comments WHERE community_comments.author_id = current_user_id;

  -- Delete user's posts
  DELETE FROM community_posts WHERE community_posts.author_id = current_user_id;

  -- Delete the user from auth.users
  -- This requires SECURITY DEFINER to have permission
  DELETE FROM auth.users WHERE id = current_user_id;

  -- Log the deletion
  RAISE NOTICE 'User % deleted successfully', current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account and all associated data';
