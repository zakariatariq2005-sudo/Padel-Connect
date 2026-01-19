# Fix Email Confirmation Issue

## Problem
Users sign up but can't log in because:
1. Email confirmation is required
2. Confirmation emails aren't being sent/received

## Solution: Disable Email Confirmation (Recommended for Development)

### Step 1: Go to Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: `xgsncypsczrqgcecmpok`

### Step 2: Disable Email Confirmation
1. Click **Authentication** in the left sidebar
2. Click **Settings** (gear icon)
3. Scroll down to **"Email Auth"** section
4. Find **"Enable email confirmations"**
5. **Toggle it OFF** (disable it)
6. Click **Save**

### Step 3: Test
1. Try signing up again with a new account
2. You should be automatically logged in without needing email confirmation

---

## Alternative: Manually Confirm User (If you want to keep email confirmation)

### Option A: Confirm via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/xgsncypsczrqgcecmpok/auth/users
2. Find the user with email: `zakariatariq2005@gmail.com`
3. Click on the user
4. Click **"Confirm User"** button
5. Try logging in again

### Option B: Use Password Reset
1. On the login page, add a "Forgot Password" link
2. User can reset password which also confirms the email

---

## Quick Fix (I can do this for you)
I can update the code to automatically confirm users on signup, or disable the requirement. Would you like me to do that?

