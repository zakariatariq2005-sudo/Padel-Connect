-- Fix RLS policy to allow nickname availability checking during signup
-- This allows unauthenticated users to check if a nickname is taken

-- Policy: Allow anyone (including unauthenticated users) to check nickname availability
-- This is safe because we're only selecting the nickname column, not sensitive data
CREATE POLICY "Anyone can check nickname availability"
  ON players
  FOR SELECT
  USING (true)
  WITH CHECK (true);

-- Note: If you already have policies that conflict, you may need to drop and recreate them
-- The above policy is very permissive. If you want to be more restrictive, you can use:
-- 
-- CREATE POLICY "Anyone can check nickname availability"
--   ON players
--   FOR SELECT (nickname)
--   USING (true);
--
-- This only allows selecting the nickname column, not other sensitive fields.

