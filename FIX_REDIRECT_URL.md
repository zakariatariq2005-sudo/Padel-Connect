# Fix Password Reset Link - Redirect to Vercel

## Problem
Password reset link goes to `localhost:3000` instead of your Vercel site.

## Solution: Update Supabase Redirect URLs

### Step 1: Go to URL Configuration
1. Go to: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/auth/url-configuration
2. Or: **Settings** → **Authentication** → **URL Configuration**

### Step 2: Update Site URL
1. Find **"Site URL"** (at the top)
2. Change from: `http://localhost:3000`
3. Change to: `https://padel-connect-cyan.vercel.app`
4. Click **"Save"**

### Step 3: Update Redirect URLs
1. Scroll to **"Redirect URLs"** section
2. **Remove** any `localhost` URLs
3. **Add** these URLs (one per line):
   ```
   https://padel-connect-cyan.vercel.app/**
   https://padel-connect-cyan.vercel.app/reset-password
   https://padel-connect-cyan.vercel.app/dashboard
   ```
4. Click **"Save"**

---

## Quick Fix: Use the Token Manually

If you want to reset your password RIGHT NOW without waiting:

1. Copy the token from the email link (the part after `#access_token=`)
2. Go to: https://padel-connect-cyan.vercel.app/reset-password
3. The page will extract the token from the URL automatically

Or manually navigate to:
```
https://padel-connect-cyan.vercel.app/reset-password#access_token=YOUR_TOKEN_HERE
```

---

## After Updating Supabase

1. Request a NEW password reset from Supabase dashboard
2. The new email link will go to your Vercel site
3. Click the link and reset your password

