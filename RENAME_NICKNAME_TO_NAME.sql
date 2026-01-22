-- Rename nickname column to name column
-- This replaces the nickname column with name (no new column created)

-- Step 1: Drop the old unique index on nickname if it exists
DROP INDEX IF EXISTS idx_players_nickname_unique;

-- Step 2: Drop the old nickname length constraint if it exists
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS nickname_length_check;

-- Step 3: Drop the old trim trigger if it exists
DROP TRIGGER IF EXISTS trim_nickname_trigger ON players;
DROP FUNCTION IF EXISTS trim_nickname();

-- Step 4: Rename the column from nickname to name
ALTER TABLE players 
RENAME COLUMN nickname TO name;

-- Step 5: Create new unique index for name to prevent duplicate usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name_unique 
ON players(name) 
WHERE name IS NOT NULL;

-- Step 6: Add length constraint (3-20 characters)
ALTER TABLE players 
ADD CONSTRAINT name_length_check 
CHECK (name IS NULL OR (char_length(trim(name)) >= 3 AND char_length(trim(name)) <= 20));

-- Step 7: Add trigger to auto-trim name
CREATE OR REPLACE FUNCTION trim_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS NOT NULL THEN
    NEW.name = trim(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trim_name_trigger
BEFORE INSERT OR UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION trim_name();

-- Verification: Check the column was renamed
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'players' AND column_name = 'name';

