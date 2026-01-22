-- Fix RLS policy to allow users to update their own nickname
-- This ensures the UPDATE policy allows nickname updates

-- Check if the policy exists and drop it if needed
DROP POLICY IF EXISTS "Users can update own profile" ON players;

-- Create/Recreate the UPDATE policy for players table
-- This allows users to update their own profile including nickname
CREATE POLICY "Users can update own profile"
  ON players
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the policy was created
-- You can check this in Supabase Dashboard → Authentication → Policies

-- Note: Make sure the nickname column exists and has proper constraints
-- Run ADD_NICKNAME_COLUMN.sql if you haven't already

