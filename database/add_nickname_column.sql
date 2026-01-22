-- ============================================
-- ADD NICKNAME COLUMN TO PLAYERS TABLE
-- ============================================
-- This script adds a mandatory nickname field to the players table.
-- Nickname must be unique and between 3-20 characters.

-- Add nickname column (nullable first to allow migration of existing data)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Create unique index for nickname
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_nickname_unique ON players(nickname) WHERE nickname IS NOT NULL;

-- For existing records without nickname, we'll need to handle them in the application
-- by redirecting to complete-profile page. The NOT NULL constraint will be added
-- after ensuring all users have nicknames through the app flow.

-- Note: After ensuring all users have nicknames, you can add:
-- ALTER TABLE players ALTER COLUMN nickname SET NOT NULL;
-- But we'll handle this through the application flow to avoid breaking existing users.

