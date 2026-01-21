# Padel Connect - Setup Checklist for Project: xgsncypsczrqgcecmpok

Quick setup checklist for your Supabase project.

## ✅ Step 1: Get Your API Key (2 minutes)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok
2. Navigate to **Settings → API**
3. Copy the **anon public** key (not the service_role key!)
4. Save it somewhere safe

## ✅ Step 2: Create .env.local File (1 minute)

1. In your project root, create a file named `.env.local`
2. Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xgsncypsczrqgcecmpok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
```

**Important:**
- No quotes around the values
- No spaces before/after the `=`
- Replace `paste-your-anon-key-here` with your actual anon key

## ✅ Step 3: Set Up Database Tables (10 minutes)

Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/sql/new

### 3.1 Create Players Table

Run this SQL:

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

-- Create indexes
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_online ON players(is_online) WHERE is_online = true;

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
```

### 3.2 Create Match Requests Table

Run this SQL:

```sql
-- Create match_requests table
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id, status)
);

-- Create indexes
CREATE INDEX idx_match_requests_sender ON match_requests(sender_id);
CREATE INDEX idx_match_requests_receiver ON match_requests(receiver_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);

-- Enable Row Level Security
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
```

### 3.3 Create Matches Table

Run this SQL:

```sql
-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (player1_id != player2_id)
);

-- Create indexes
CREATE INDEX idx_matches_player1 ON matches(player1_id);
CREATE INDEX idx_matches_player2 ON matches(player2_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
```

## ✅ Step 4: Set Up RLS Policies (5 minutes)

### 4.1 Players Table Policies

Run this SQL:

```sql
-- Policy: Users can read all online players
CREATE POLICY "Anyone can view online players"
  ON players FOR SELECT
  USING (is_online = true);

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON players FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON players FOR UPDATE
  USING (auth.uid() = user_id);
```

### 4.2 Match Requests Table Policies

Run this SQL:

```sql
-- Policy: Users can view match requests they sent or received
CREATE POLICY "Users can view own match requests"
  ON match_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can create match requests
CREATE POLICY "Users can create match requests"
  ON match_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update match requests they received
CREATE POLICY "Users can update received match requests"
  ON match_requests FOR UPDATE
  USING (auth.uid() = receiver_id);
```

### 4.3 Matches Table Policies

Run this SQL:

```sql
-- Policy: Only match participants can view their matches
CREATE POLICY "Participants can view own matches"
  ON matches FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Policy: Authenticated users can create matches
CREATE POLICY "Authenticated users can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Policy: Match participants can update match status
CREATE POLICY "Participants can update match status"
  ON matches FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);
```

## ✅ Step 5: Enable Real-time (2 minutes)

### Option 1: Via Dashboard (Recommended)
1. Go to **Database → Replication**
2. Find the `matches` table
3. Toggle ON the replication

### Option 2: Via SQL

Run this SQL:

```sql
-- Enable real-time for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
```

## ✅ Step 6: Create Updated At Triggers (2 minutes - Optional but Recommended)

Run this SQL:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_requests_updated_at BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## ✅ Step 7: Configure Authentication (2 minutes)

1. Go to **Authentication → Settings**
2. For development, you may want to **disable "Enable email confirmations"**
   - This allows immediate login after signup
   - For production, keep it enabled
3. Configure email templates if needed

## ✅ Step 8: Verify Setup

1. Check tables exist:
   - Go to **Table Editor**
   - Should see: `players`, `match_requests`, `matches`

2. Check RLS is enabled:
   - Go to **Authentication → Policies**
   - Should see policies for all three tables

3. Check real-time:
   - Go to **Database → Replication**
   - `matches` table should be enabled

## ✅ Step 9: Test Your Setup

1. Install dependencies (if not done):
   ```bash
   npm install
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Open browser:
   - Navigate to `http://localhost:3000`
   - Should redirect to `/login`

4. Create test account:
   - Click "Sign up"
   - Fill in the form
   - Submit

5. Check database:
   - Go to Supabase → **Table Editor → players**
   - Should see your new player profile

## 🚨 Troubleshooting

### "Invalid API key" error
- Check `.env.local` file exists
- Verify anon key is correct (no quotes, no spaces)
- Restart dev server: `npm run dev`

### "relation does not exist" error
- Run all SQL scripts in order
- Check tables exist in Table Editor

### "new row violates row-level security policy"
- Verify all RLS policies are created
- Check user is authenticated

### Real-time not working
- Enable replication for `matches` table
- Check browser console for WebSocket errors

## ✅ Quick Links

- **Project Dashboard**: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok
- **API Settings**: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/settings/api
- **SQL Editor**: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/editor
- **Replication Settings**: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/database/replication

---

**Next Steps**: Once setup is complete, follow the `VERIFICATION_GUIDE.md` to test all functionality!









