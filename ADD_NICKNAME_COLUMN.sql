-- Add nickname column to players table
-- This script adds the nickname column with proper constraints

-- Step 1: Add the nickname column (nullable first to allow existing data)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Step 2: Create unique index for nickname (allows NULL for now)
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_nickname_unique 
ON players(nickname) 
WHERE nickname IS NOT NULL;

-- Step 3: For existing rows without nickname, set a temporary value
-- This ensures we can add NOT NULL constraint later
-- Note: You may want to manually set nicknames for existing users
UPDATE players 
SET nickname = 'user_' || substring(user_id::text, 1, 8)
WHERE nickname IS NULL;

-- Step 4: Add NOT NULL constraint
ALTER TABLE players 
ALTER COLUMN nickname SET NOT NULL;

-- Step 5: Add check constraint for length (3-20 characters)
ALTER TABLE players 
ADD CONSTRAINT nickname_length_check 
CHECK (char_length(trim(nickname)) >= 3 AND char_length(trim(nickname)) <= 20);

-- Step 6: Add trigger to trim nickname on insert/update
CREATE OR REPLACE FUNCTION trim_nickname()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nickname = trim(NEW.nickname);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trim_nickname_trigger ON players;
CREATE TRIGGER trim_nickname_trigger
BEFORE INSERT OR UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION trim_nickname();

-- Verification query (run this to check):
-- SELECT user_id, nickname, char_length(nickname) as nickname_length 
-- FROM players 
-- ORDER BY created_at DESC 
-- LIMIT 10;

