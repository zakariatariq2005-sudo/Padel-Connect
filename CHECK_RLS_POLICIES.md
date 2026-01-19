# Check RLS Policies for Online Players

## Problem
Online players section is not showing even though both profiles exist in the database.

## Solution: Verify RLS Policies

### Step 1: Go to Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/sql/new
2. Or: SQL Editor → New Query

### Step 2: Check if the policy exists
Run this query to see all policies on the players table:

```sql
SELECT * FROM pg_policies WHERE tablename = 'players';
```

### Step 3: If the policy doesn't exist, create it
Run this SQL:

```sql
-- Policy: Users can read all online players (for the dashboard)
CREATE POLICY "Anyone can view online players"
  ON players
  FOR SELECT
  USING (is_online = true);
```

### Step 4: Verify players are online
Check if both players have `is_online = true`:

```sql
SELECT user_id, name, is_online, location, skill_level 
FROM players;
```

Both players should have `is_online = true`.

### Step 5: Test the query directly
Test if you can see online players:

```sql
SELECT * FROM players WHERE is_online = true;
```

This should return all players with `is_online = true`.

---

## Alternative: Temporarily disable RLS for testing

**WARNING: Only for testing! Re-enable after debugging.**

```sql
-- Disable RLS temporarily
ALTER TABLE players DISABLE ROW LEVEL SECURITY;

-- Test your query
SELECT * FROM players WHERE is_online = true;

-- Re-enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
```

---

## Check Browser Console

1. Open your website: https://padel-connect-cyan.vercel.app
2. Press **F12** (or right-click → Inspect)
3. Click the **Console** tab
4. Look for messages starting with "All online players" or "Error loading"
5. Share what you see there

