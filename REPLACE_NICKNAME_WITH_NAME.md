# Replace Nickname Column with Name Column

## Quick Fix

This will **rename** the existing `nickname` column to `name` (no new column is created).

### Steps:

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run this SQL:**

```sql
-- Drop old constraints and triggers
DROP INDEX IF EXISTS idx_players_nickname_unique;
ALTER TABLE players DROP CONSTRAINT IF EXISTS nickname_length_check;
DROP TRIGGER IF EXISTS trim_nickname_trigger ON players;
DROP FUNCTION IF EXISTS trim_nickname();

-- Rename the column from nickname to name
ALTER TABLE players RENAME COLUMN nickname TO name;

-- Create new unique index to prevent duplicate usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name_unique 
ON players(name) 
WHERE name IS NOT NULL;

-- Add length constraint (3-20 characters)
ALTER TABLE players 
ADD CONSTRAINT name_length_check 
CHECK (name IS NULL OR (char_length(trim(name)) >= 3 AND char_length(trim(name)) <= 20));

-- Add trigger to auto-trim name
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
```

3. **Click "Run"** (or press Ctrl/Cmd + Enter)

4. **Verify it worked:**
   Run this to check:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'players' AND column_name = 'name';
   ```

5. **Done!** The `nickname` column is now `name` and all existing data is preserved.

## What this does:

- ✅ Renames `nickname` column to `name` (preserves all existing data)
- ✅ Removes old nickname constraints and triggers
- ✅ Ensures usernames are unique (no duplicates allowed)
- ✅ Validates name length (3-20 characters)
- ✅ Auto-trims whitespace from names

No new column is created - the existing `nickname` column is simply renamed to `name`!

