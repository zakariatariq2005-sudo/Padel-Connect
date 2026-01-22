# Add Name Column to Players Table

Since the `nickname` column doesn't exist, we'll just add the `name` column directly.

## Steps:

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run this SQL:**

```sql
-- Add the name column
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Create unique index to prevent duplicate usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name_unique 
ON players(name) 
WHERE name IS NOT NULL;

-- Add length constraint (3-20 characters)
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS name_length_check;

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

DROP TRIGGER IF EXISTS trim_name_trigger ON players;
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

5. **Try signing up again** - it should work now!

## What this does:

- ✅ Adds a `name` column to store usernames
- ✅ Ensures usernames are unique (no duplicates allowed)
- ✅ Validates name length (3-20 characters)
- ✅ Auto-trims whitespace from names

The unique index ensures that no two users can have the same name!

