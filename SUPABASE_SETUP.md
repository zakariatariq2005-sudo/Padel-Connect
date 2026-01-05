# Supabase Setup Instructions for PadelConnect

This document explains how to set up your Supabase database and configure the necessary tables, security policies, and real-time subscriptions for the PadelConnect application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the following:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

4. Create a `.env.local` file in your project root with:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 2: Create Database Tables

Run the following SQL in your Supabase SQL Editor (SQL Editor in the left sidebar):

### Table 1: `players`

This table stores player profiles linked to authenticated users.

```sql
-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
  location TEXT NOT NULL,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_online ON players(is_online) WHERE is_online = true;

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
```

### Table 2: `match_requests`

This table stores match requests between players.

```sql
-- Create match_requests table
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id, status) -- Prevent duplicate pending requests
);

-- Create indexes
CREATE INDEX idx_match_requests_sender ON match_requests(sender_id);
CREATE INDEX idx_match_requests_receiver ON match_requests(receiver_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);

-- Enable Row Level Security
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
```

### Table 3: `matches`

This table stores active and completed matches.

```sql
-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (player1_id != player2_id) -- Prevent self-matches
);

-- Create indexes
CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
```

## Step 3: Set Up Row Level Security (RLS) Policies

RLS ensures users can only access data they're authorized to see.

### Players Table Policies

```sql
-- Policy: Users can read all online players (for the dashboard)
CREATE POLICY "Anyone can view online players"
  ON players
  FOR SELECT
  USING (is_online = true);

-- Policy: Users can view their own player profile
CREATE POLICY "Users can view own profile"
  ON players
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own player profile
CREATE POLICY "Users can insert own profile"
  ON players
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own player profile
CREATE POLICY "Users can update own profile"
  ON players
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Match Requests Table Policies

```sql
-- Policy: Users can view match requests they sent or received
CREATE POLICY "Users can view own match requests"
  ON match_requests
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can create match requests
CREATE POLICY "Users can create match requests"
  ON match_requests
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update match requests they received (to accept/reject)
CREATE POLICY "Users can update received match requests"
  ON match_requests
  FOR UPDATE
  USING (auth.uid() = receiver_id);
```

### Matches Table Policies

```sql
-- Policy: Only match participants can view their matches
CREATE POLICY "Participants can view own matches"
  ON matches
  FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Policy: Anyone authenticated can create matches (matches are created when requests are accepted)
CREATE POLICY "Authenticated users can create matches"
  ON matches
  FOR INSERT
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Policy: Match participants can update match status
CREATE POLICY "Participants can update match status"
  ON matches
  FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);
```

## Step 4: Enable Real-time for Matches

To enable real-time updates on the live match page:

1. Go to Database → Replication in your Supabase dashboard
2. Find the `matches` table
3. Toggle ON the replication for the `matches` table

Alternatively, you can run this SQL:

```sql
-- Enable real-time for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
```

## Step 5: Create Updated At Trigger (Optional but Recommended)

This automatically updates the `updated_at` timestamp when records are modified:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to players table
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to match_requests table
CREATE TRIGGER update_match_requests_updated_at BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to matches table
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 6: Configure Authentication

1. Go to Authentication → Settings in your Supabase dashboard
2. Ensure "Enable email confirmations" is set to your preference (for development, you may want to disable it)
3. Configure email templates if needed

## Testing Your Setup

1. Start your Next.js app: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try signing up a new account
4. Sign up a second account in an incognito window
5. Test the match request flow

## Troubleshooting

### "relation does not exist" error
- Make sure you ran all the SQL statements in the correct order
- Check that you're in the correct Supabase project

### "new row violates row-level security policy" error
- Verify that all RLS policies are created correctly
- Check that the user is authenticated (auth.uid() is not null)

### Real-time updates not working
- Ensure real-time is enabled for the `matches` table
- Check browser console for WebSocket connection errors
- Verify your Supabase project allows real-time connections

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only see and modify data they're authorized for
- Never expose your service role key in client-side code
- The anon key is safe to use in the browser as it respects RLS policies


