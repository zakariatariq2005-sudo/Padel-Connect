# Padel Connect - Verification Guide

This guide will help you verify that all functionality is working correctly.

## Prerequisites Checklist

Before testing, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase project created
- [ ] `.env.local` file with Supabase credentials
- [ ] Database tables created (from `SUPABASE_SETUP.md`)

## Step 1: Install Dependencies

```bash
npm install
```

**Expected:** No errors, all packages installed successfully.

## Step 2: Verify Environment Variables

Check that `.env.local` exists and contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Expected:** File exists with correct values (no quotes, no extra spaces).

## Step 3: Verify Database Setup

### 3.1 Check Tables Exist

Go to your Supabase dashboard → Table Editor and verify:

- [ ] `players` table exists
- [ ] `match_requests` table exists  
- [ ] `matches` table exists

### 3.2 Check Row Level Security (RLS)

Go to Supabase dashboard → Authentication → Policies and verify:

- [ ] RLS is enabled on all three tables
- [ ] Policies are created (see `SUPABASE_SETUP.md`)

### 3.3 Check Real-time

Go to Supabase dashboard → Database → Replication and verify:

- [ ] `matches` table has real-time enabled

## Step 4: Start Development Server

```bash
npm run dev
```

**Expected:** Server starts on `http://localhost:3000` with no errors.

## Step 5: Test Authentication Flow

### 5.1 Test Signup

1. Navigate to `http://localhost:3000`
2. You should be redirected to `/login`
3. Click "Sign up" link
4. Fill out the signup form:
   - Name: "Test Player"
   - Email: `test@example.com` (use a real email if email confirmation is enabled)
   - Password: `password123` (min 6 characters)
   - Skill Level: Select any
   - Location: "Test City"
5. Click "Sign Up"

**Expected Results:**
- If email confirmation is **disabled**: Redirects to dashboard immediately
- If email confirmation is **enabled**: Shows message to check email, redirects to login

**Verify in Supabase:**
- Go to Authentication → Users → Should see new user
- Go to Table Editor → `players` → Should see new player profile

### 5.2 Test Login

1. If you were redirected to login, or navigate to `/login`
2. Enter email and password
3. Click "Log In"

**Expected Results:**
- Redirects to `/dashboard`
- No error messages
- Dashboard loads successfully

**Verify:**
- Check browser console (F12) → No errors
- Player's `is_online` status should be `true` in database

### 5.3 Test Logout

1. On dashboard, click "Logout" button
2. Should redirect to `/login`

**Expected Results:**
- Redirects to login page
- Player's `is_online` status should be `false` in database

## Step 6: Test Dashboard Functionality

### 6.1 View Online Players

1. Create **two separate accounts** (use incognito window for second account)
2. Log in with both accounts
3. On first account's dashboard, you should see the second player listed

**Expected Results:**
- Second player appears in "Online Players" section
- Shows name, skill level, and location
- "Request Match" button is visible

**If no players show:**
- Check both players have `is_online = true` in database
- Check RLS policies allow viewing online players

### 6.2 Test Match Request - Send

1. On first account, click "Request Match" on second player
2. Should see success message/alert

**Expected Results:**
- Alert says "Match request sent!"
- Dashboard refreshes
- Request appears in "Your Match Requests" section

**Verify in Database:**
- Go to `match_requests` table
- Should see new row with:
  - `sender_id` = first account's user_id
  - `receiver_id` = second account's user_id
  - `status` = 'pending'

### 6.3 Test Match Request - Receive

1. On **second account** (in incognito window), refresh dashboard
2. Should see incoming request in "Incoming Match Requests" section

**Expected Results:**
- Request card shows first player's name
- Shows "Accept" and "Reject" buttons

### 6.4 Test Match Request - Accept

1. On second account, click "Accept" button
2. Should redirect to live match page

**Expected Results:**
- Redirects to `/match/[match-id]`
- Match page loads
- Shows both players' information
- Match status shows "⏳ Waiting"

**Verify in Database:**
- Go to `match_requests` table → Status should be 'accepted'
- Go to `matches` table → Should see new match with:
  - `player1_id` = sender's user_id
  - `player2_id` = receiver's user_id
  - `status` = 'waiting'

### 6.5 Test Match Request - Reject

1. Send another match request from first account
2. On second account, click "Reject"
3. Dashboard should refresh

**Expected Results:**
- Request disappears from "Incoming Match Requests"
- No match is created
- Request status in database is 'rejected'

## Step 7: Test Live Match Page

### 7.1 View Match Details

1. Both players should be on the live match page (after accepting request)
2. Verify match information displays correctly

**Expected Results:**
- Shows match status badge (⏳ Waiting)
- Shows both players' cards with names, skill levels, locations
- Shows match ID and timestamps
- "Back to Dashboard" button works

### 7.2 Test Real-time Updates (Optional)

To test real-time updates, you need to manually update the match status in Supabase:

1. Go to Supabase dashboard → Table Editor → `matches`
2. Find the match record
3. Update `status` from 'waiting' to 'in_progress'
4. Save

**Expected Results:**
- Both players' browsers should update automatically
- Status badge changes to "🎾 In Progress" (green)
- No page refresh needed

**If real-time doesn't work:**
- Check real-time is enabled for `matches` table
- Check browser console for WebSocket errors
- Verify Supabase project allows real-time connections

## Step 8: Test Route Protection

### 8.1 Test Protected Routes

1. Log out
2. Try to access `http://localhost:3000/dashboard` directly

**Expected Results:**
- Redirects to `/login` automatically

### 8.2 Test Auth Route Redirect

1. While logged in, try to access `http://localhost:3000/login`

**Expected Results:**
- Redirects to `/dashboard` automatically

## Step 9: Test Edge Cases

### 9.1 Test Duplicate Match Request

1. Send a match request
2. Try to send another request to the same player

**Expected Results:**
- Should prevent duplicate pending requests (database constraint)
- Or show appropriate error message

### 9.2 Test Profile Creation on Login

1. Create a user account
2. Manually delete the player profile from database
3. Log in again

**Expected Results:**
- Profile is automatically recreated
- Login succeeds
- Dashboard loads

### 9.3 Test Multiple Players

1. Create 3+ accounts
2. Log in with all of them
3. Check dashboard shows all other online players

**Expected Results:**
- All online players appear
- Can send requests to any player
- No duplicate entries

## Step 10: Check for Errors

### 10.1 Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through the app

**Expected Results:**
- No red errors
- No warnings about missing dependencies
- Only expected Supabase connection messages

### 10.2 Terminal/Server Logs

Check the terminal where `npm run dev` is running:

**Expected Results:**
- No error messages
- No TypeScript errors
- Clean compilation

### 10.3 Network Tab

1. Open DevTools → Network tab
2. Use the app normally

**Expected Results:**
- API calls to Supabase succeed (200 status)
- No failed requests
- Real-time WebSocket connection established

## Troubleshooting Common Issues

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Invalid API key" or connection errors

**Solution:**
- Double-check `.env.local` file
- Restart dev server after changing `.env.local`
- Verify Supabase project is active (not paused)

### Issue: "relation does not exist" error

**Solution:**
- Run all SQL scripts from `SUPABASE_SETUP.md`
- Check tables exist in Supabase dashboard
- Verify you're using the correct project

### Issue: "new row violates row-level security policy"

**Solution:**
- Check RLS policies are created correctly
- Verify user is authenticated (check `auth.users` table)
- Review RLS policies in Supabase dashboard

### Issue: Real-time updates not working

**Solution:**
- Enable real-time for `matches` table in Supabase
- Check WebSocket connection in browser console
- Verify Supabase project allows real-time connections

### Issue: Players not showing on dashboard

**Solution:**
- Check `is_online = true` in database
- Verify RLS policy allows viewing online players
- Check both players are logged in
- Refresh the page

## Success Criteria

✅ All tests pass
✅ No console errors
✅ All features work as expected
✅ Database operations succeed
✅ Real-time updates work (if tested)
✅ Route protection works
✅ Edge cases handled gracefully

## Next Steps After Verification

Once everything is verified:

1. **Deploy to Production:**
   - Follow `DEPLOYMENT.md` guide
   - Deploy to Vercel or your preferred platform

2. **Set Up Production Database:**
   - Use production Supabase project
   - Run all SQL setup scripts
   - Configure environment variables

3. **Monitor:**
   - Check Supabase logs for errors
   - Monitor real-time connections
   - Review user activity

---

**Need Help?** Check the troubleshooting section or review the code comments in each component file.











