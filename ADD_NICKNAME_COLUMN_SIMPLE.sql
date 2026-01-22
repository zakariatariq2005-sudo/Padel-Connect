-- Simple migration to add nickname column to players table
-- Run this in your Supabase SQL Editor

-- Step 1: Add the nickname column (nullable first)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Step 2: Create unique index for nickname (allows NULL for now)
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_nickname_unique 
ON players(nickname) 
WHERE nickname IS NOT NULL;

-- Step 3: For existing rows without nickname, set a temporary value
-- This ensures we can add NOT NULL constraint later
UPDATE players 
SET nickname = 'user_' || substring(user_id::text, 1, 8)
WHERE nickname IS NULL;

-- Step 4: Add NOT NULL constraint (only if you want to enforce it)
-- Uncomment the line below if you want nickname to be required
-- ALTER TABLE players ALTER COLUMN nickname SET NOT NULL;

-- Step 5: Add check constraint for length (3-20 characters)
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS nickname_length_check;

ALTER TABLE players 
ADD CONSTRAINT nickname_length_check 
CHECK (nickname IS NULL OR (char_length(trim(nickname)) >= 3 AND char_length(trim(nickname)) <= 20));

-- Step 6: Add trigger to trim nickname on insert/update
CREATE OR REPLACE FUNCTION trim_nickname()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nickname IS NOT NULL THEN
    NEW.nickname = trim(NEW.nickname);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trim_nickname_trigger ON players;
CREATE TRIGGER trim_nickname_trigger
BEFORE INSERT OR UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION trim_nickname();

-- Verification: Check if column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'players' AND column_name = 'nickname';

