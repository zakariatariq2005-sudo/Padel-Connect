# Matchmaking System Setup Guide

## Step 1: Update Database Schema

Run the SQL script in Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `database/matchmaking_schema.sql`
4. Copy and paste the entire SQL script
5. Click **Run**

This will:
- Add `expires_at` column to `match_requests` table
- Add `match_id` column to link requests to matches
- Create unique constraints to prevent duplicate requests
- Create helper functions for validation
- Set up triggers for auto-updating timestamps

## Step 2: Enable Realtime (if not already enabled)

1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable replication for:
   - `match_requests` table
   - `matches` table
   - `players` table (for online status)

Or run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE match_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
```

## Step 3: Verify RLS Policies

Make sure you have the following RLS policies (from `SUPABASE_SETUP.md`):

### Players Table
- ✅ Anyone can view online players
- ✅ Users can view/update their own profile

### Match Requests Table
- ✅ Users can view requests they sent or received
- ✅ Users can create requests (as sender)
- ✅ Users can update requests they received (to accept/reject)

### Matches Table
- ✅ Participants can view their matches
- ✅ Authenticated users can create matches
- ✅ Participants can update match status

## Step 4: Test the System

1. **Create two test accounts** (or use existing ones)

2. **Log in as User 1**:
   - Toggle "Online" status ON
   - Go to Dashboard
   - You should see User 2 (if they're online)

3. **Send a match request**:
   - Click "Request Match" on User 2's card
   - You should see a success message

4. **Log in as User 2**:
   - Go to `/requests` page
   - You should see the incoming request from User 1
   - Click "Accept"

5. **Verify**:
   - Both users should be redirected to the match page
   - The request should appear in "Confirmed Matches"
   - Both users should no longer appear in each other's online players list

## Step 5: Test Business Rules

### Test 1: One Request at a Time
- As User 1, send a request to User 2
- Try to send another request to a different user
- Should see error: "You already have an active match request"

### Test 2: Online Requirement
- As User 1, toggle offline
- Try to send a request
- Should see error: "You must be online to send match requests"

### Test 3: Request Expiration
- Send a request
- Wait 30 minutes (or manually expire in database)
- Try to accept the expired request
- Should see error: "This request has expired"

### Test 4: Duplicate Prevention
- As User 1, send request to User 2
- As User 2, try to send request to User 1
- Should see error: "This player already sent you a request"

## Troubleshooting

### "Relation does not exist" error
- Make sure you ran the database schema SQL script
- Check that tables exist in Supabase dashboard

### "Permission denied" error
- Check RLS policies are set up correctly
- Verify user is authenticated

### Real-time updates not working
- Check Realtime is enabled for the tables
- Verify Supabase connection in browser console
- Check network tab for WebSocket connections

### Requests not expiring
- Expiration happens on-demand (when operations occur)
- For production, consider setting up a cron job
- You can manually expire by running:
  ```sql
  UPDATE match_requests 
  SET status = 'expired' 
  WHERE status = 'pending' 
    AND expires_at < NOW();
  ```

## Production Considerations

1. **Auto-expiration**: Currently requests expire on-demand. For production, set up:
   - Supabase Edge Function (scheduled)
   - Or external cron job
   - Or database trigger (less recommended)

2. **Rate limiting**: Consider adding rate limits to prevent spam

3. **Notifications**: Add push notifications for new requests

4. **Analytics**: Track request acceptance rates, average response time

5. **Monitoring**: Monitor for failed requests, expired requests, etc.

## Files Created

- `app/actions/matchmaking.ts` - Server Actions for all operations
- `app/requests/page.tsx` - Requests page (Server Component)
- `components/RequestsClient.tsx` - Client component with real-time updates
- `components/MatchRequestCard.tsx` - Individual request card
- `components/ConfirmedMatchCard.tsx` - Confirmed match card
- `components/OnlineToggle.tsx` - Online/offline toggle
- `database/matchmaking_schema.sql` - Database schema updates
- `README_MATCHMAKING.md` - Full system documentation

## Next Steps

1. ✅ Run database schema SQL
2. ✅ Enable Realtime
3. ✅ Test with two accounts
4. ✅ Deploy to Vercel
5. 🔄 Set up auto-expiration cron (optional)
6. 🔄 Add push notifications (optional)
7. 🔄 Implement chat in matches (optional)




