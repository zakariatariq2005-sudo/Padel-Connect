-- Add photo_url column to players table if it doesn't exist
-- This stores the URL of the profile photo uploaded to Supabase Storage

-- Step 1: Add the photo_url column (nullable - optional)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN players.photo_url IS 'URL of the profile photo stored in Supabase Storage (avatars bucket)';

-- Verification query (run this to check):
-- SELECT user_id, nickname, photo_url 
-- FROM players 
-- ORDER BY created_at DESC 
-- LIMIT 10;

