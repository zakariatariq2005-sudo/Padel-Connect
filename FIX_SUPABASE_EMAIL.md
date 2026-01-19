# Fix Supabase Email Not Sending

## Problem
Confirmation emails aren't being sent from Supabase.

## Why This Happens
Supabase's free tier has limited email sending. You need to either:
1. Configure SMTP (custom email service)
2. Use Supabase's built-in email (limited)
3. Disable email confirmation (easiest for development)

## Solution 1: Configure SMTP (For Production)

### Step 1: Get SMTP Credentials
You can use:
- **Gmail SMTP** (free, but requires app password)
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **Resend** (free tier: 3,000 emails/month)

### Step 2: Add to Supabase
1. Go to: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/settings/auth
2. Scroll to **"SMTP Settings"**
3. Enter your SMTP credentials:
   - **Host**: smtp.gmail.com (for Gmail)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: your app password
   - **Sender email**: your-email@gmail.com
   - **Sender name**: Padel Connect
4. Click **"Save"**

### Step 3: Test
Try sending a confirmation email again.

---

## Solution 2: Disable Email Confirmation (Recommended for Now)

Since you already disabled "Confirm email" in the settings, you don't need emails at all!

1. Make sure "Confirm email" is **OFF** (which it is)
2. Click **"Save changes"**
3. Try logging in - it should work without email confirmation

---

## Solution 3: Manually Confirm Your Account

If you want to use your existing account without emails:

1. Go to: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/auth/users
2. Find your user: `zakariatariq2005@gmail.com`
3. Click on the user
4. Click **"Confirm User"** button
5. Try logging in

---

## Quick Fix Right Now

Since email confirmation is already disabled, you should be able to:
1. **Sign up a NEW account** - it will work immediately
2. **Or manually confirm your existing account** (Solution 3 above)

The "Resend confirmation email" button won't work if Supabase email isn't configured, but you don't need it since email confirmation is disabled!

