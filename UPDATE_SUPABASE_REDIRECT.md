# Update Supabase Redirect URL

## Problem
Password reset links say "site can't be reached" because Supabase is using the wrong redirect URL.

## Fix: Update Supabase Site URL

### Step 1: Go to Supabase Auth Settings
1. Go to: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/auth/url-configuration
2. Or: Settings → Authentication → URL Configuration

### Step 2: Update Site URL
1. Find **"Site URL"** field
2. Change it to: `https://padel-connect-cyan.vercel.app`
3. Click **"Save"**

### Step 3: Update Redirect URLs
1. In the same page, find **"Redirect URLs"**
2. Add these URLs (one per line):
   ```
   https://padel-connect-cyan.vercel.app/**
   https://padel-connect-cyan.vercel.app/reset-password
   https://padel-connect-cyan.vercel.app/dashboard
   ```
3. Click **"Save"**

---

## After Updating

1. Try the password reset again from Supabase dashboard
2. The link should now work and redirect to your Vercel site
3. You'll be able to reset your password

---

## Quick Alternative: Reset Password from Login Page

I've added a "Reset password" button on the login page that will work once Supabase redirect URLs are updated.

