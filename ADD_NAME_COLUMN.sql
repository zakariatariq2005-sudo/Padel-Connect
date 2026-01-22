-- Add name column to players table (replaces nickname)
-- Run this in your Supabase SQL Editor

-- Step 1: Add the name column (nullable first)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Step 2: Create unique index for name to prevent duplicate usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name_unique 
ON players(name) 
WHERE name IS NOT NULL;

-- Step 3: For existing rows without name, set a temporary value
-- This ensures we can add NOT NULL constraint later
UPDATE players 
SET name = 'user_' || substring(user_id::text, 1, 8)
WHERE name IS NULL;

-- Step 4: Add NOT NULL constraint (only if you want to enforce it)
-- Uncomment the line below if you want name to be required
-- ALTER TABLE players ALTER COLUMN name SET NOT NULL;

-- Step 5: Add check constraint for length (3-20 characters)
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS name_length_check;

ALTER TABLE players 
ADD CONSTRAINT name_length_check 
CHECK (name IS NULL OR (char_length(trim(name)) >= 3 AND char_length(trim(name)) <= 20));

-- Step 6: Add trigger to trim name on insert/update
CREATE OR REPLACE FUNCTION trim_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS NOT NULL THEN
    NEW.name = trim(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trim_name_trigger ON players;
CREATE TRIGGER trim_name_trigger
BEFORE INSERT OR UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION trim_name();

-- Verification: Check if column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'players' AND column_name = 'name';

