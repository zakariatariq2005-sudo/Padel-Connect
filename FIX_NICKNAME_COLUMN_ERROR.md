# Fix: "Could not find the 'nickname' column" Error

## Problem
You're getting this error when trying to sign up:
```
Failed to create profile: Could not find the 'nickname' column of 'players' in the schema cache.
```

This means the `nickname` column doesn't exist in your `players` table yet.

## Solution

You need to add the `nickname` column to your database. Follow these steps:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run the Migration
Copy and paste the entire contents of `ADD_NICKNAME_COLUMN_SIMPLE.sql` into the SQL Editor and click "Run" (or press Ctrl/Cmd + Enter).

Alternatively, you can run this simplified version:

```sql
-- Add nickname column to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Create unique index for nickname
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_nickname_unique 
ON players(nickname) 
WHERE nickname IS NOT NULL;

-- Add length constraint (3-20 characters)
ALTER TABLE players 
DROP CONSTRAINT IF EXISTS nickname_length_check;

ALTER TABLE players 
ADD CONSTRAINT nickname_length_check 
CHECK (nickname IS NULL OR (char_length(trim(nickname)) >= 3 AND char_length(trim(nickname)) <= 20));

-- Add trigger to auto-trim nickname
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
```

### Step 3: Verify
After running the migration, verify the column was added:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'players' AND column_name = 'nickname';
```

You should see a row with `nickname` as the column name.

### Step 4: Try Signing Up Again
Once the migration is complete, try creating a new account again. The error should be resolved.

## Note
If you have existing users in your database, they will need to set their nickname from the profile page, or you can update them manually using SQL.

