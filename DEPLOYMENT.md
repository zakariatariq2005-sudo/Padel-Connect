# Deploying Impero Sport to Vercel

This guide will walk you through deploying your Impero Sport app to Vercel, making it accessible to everyone on the internet!

## What You'll Need

- A GitHub account (free) - https://github.com
- A Vercel account (free) - https://vercel.com
- Your Supabase credentials (from your Supabase project)

## Overview

Here's what we'll do:
1. **Push your code to GitHub** (like Dropbox for code)
2. **Connect GitHub to Vercel** (tell Vercel where your code is)
3. **Add environment variables** (give Vercel your Supabase keys)
4. **Deploy!** (Vercel builds and publishes your app automatically)

---

## Step 1: Prepare Your Code for GitHub

### 1.1 Initialize Git (if not already done)

Git is a version control system that tracks changes to your code. We'll use it to upload your code to GitHub.

Open your terminal in the project folder and run:

```bash
git init
```

**What this does**: Creates a new Git repository in your project folder.

### 1.2 Stage All Files

```bash
git add .
```

**What this does**: Tells Git to track all your project files (except those in `.gitignore`).

### 1.3 Create Your First Commit

```bash
git commit -m "Initial commit: Impero Sport app"
```

**What this does**: Saves a snapshot of your code. Think of it like a checkpoint you can return to.

---

## Step 2: Create a GitHub Repository

### 2.1 Create a New Repository on GitHub

1. Go to https://github.com and sign in (or create an account)
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `clay tennisconnect` (or any name you like)
   - **Description**: "Padel player matching app"
   - **Visibility**: Choose **Public** (free) or **Private** (if you have GitHub Pro)
   - **DO NOT** check "Initialize with README" (we already have one)
   - **DO NOT** add a .gitignore or license (we already have these)
5. Click **"Create repository"**

### 2.2 Connect Your Local Code to GitHub

GitHub will show you some commands. Use the "push an existing repository" option:

```bash
git remote add origin https://github.com/YOUR_USERNAME/clay tennisconnect.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

**What this does**:
- `git remote add origin`: Links your local code to the GitHub repository
- `git branch -M main`: Names your main branch "main"
- `git push -u origin main`: Uploads your code to GitHub

You'll be prompted to enter your GitHub username and password (or a personal access token).

**Note**: If you're using a personal access token instead of a password:
- Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate a new token with `repo` permissions
- Use this token as your password

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up for Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (this makes connecting easier)
4. Authorize Vercel to access your GitHub account

### 3.2 Import Your Project

1. After signing in, you'll see the Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. You'll see a list of your GitHub repositories
4. Find **"clay tennisconnect"** (or whatever you named it) and click **"Import"**

### 3.3 Configure Project Settings

Vercel will automatically detect it's a Next.js project. The default settings are usually perfect:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Just click "Deploy" for now** - we'll add environment variables in the next step!

---

## Step 4: Add Environment Variables

This is the most important step! Your app needs your Supabase credentials to work.

### 4.1 Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. You'll see:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string of characters)

### 4.2 Add Variables to Vercel

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. You'll add two variables:

   **Variable 1:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Paste your Supabase Project URL
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 2:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Paste your Supabase anon/public key
   - **Environment**: Select all (Production, Preview, Development)
   - Click **"Save"**

**What this does**: These variables are injected into your app when it builds, so your app can connect to Supabase.

### 4.3 Redeploy with Environment Variables

After adding the environment variables:

1. Go to the **"Deployments"** tab in your Vercel dashboard
2. Find your latest deployment
3. Click the **"..."** (three dots) menu
4. Select **"Redeploy"**
5. Check **"Use existing Build Cache"** (optional, but faster)
6. Click **"Redeploy"**

**What this does**: Rebuilds your app with the new environment variables, so it can now connect to Supabase.

---

## Step 5: Test Your Deployed App

1. Once the deployment finishes, click the deployment
2. You'll see a URL like `https://clay tennisconnect.vercel.app`
3. Click the URL to open your live app!
4. Try signing up a new account - it should work!

---

## Automatic Deployments

The best part? **Every time you push code to GitHub, Vercel automatically deploys it!**

### How to Update Your App

1. Make changes to your code locally
2. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```
3. Push to GitHub:
   ```bash
   git push
   ```
4. Vercel automatically detects the change and starts a new deployment!
5. Wait a few minutes, and your changes are live!

---

## Troubleshooting

### "Build Failed" Error

**Common causes:**
- Missing environment variables (make sure you added both Supabase variables)
- Syntax errors in your code
- Missing dependencies

**Solution:**
- Check the build logs in Vercel (click on the failed deployment)
- Look for error messages - they'll tell you what's wrong
- Make sure all environment variables are added correctly

### "Cannot connect to Supabase" Error

**Cause**: Environment variables not set correctly

**Solution:**
1. Double-check your environment variables in Vercel Settings
2. Make sure the values are correct (no extra spaces)
3. Redeploy after adding/fixing variables

### App Works Locally but Not on Vercel

**Common causes:**
- Environment variables missing in Vercel
- Database not set up (run the SQL from SUPABASE_SETUP.md)
- Real-time not enabled in Supabase

**Solution:**
- Verify all environment variables are in Vercel
- Check Supabase dashboard - make sure tables exist
- Enable real-time replication for the `matches` table

### Changes Not Showing Up

**Cause**: Cache or deployment not finished

**Solution:**
- Wait a few minutes for deployment to complete
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check Vercel dashboard to confirm deployment succeeded

---

## What Happens Behind the Scenes

When you push code to GitHub and Vercel deploys it:

1. **Vercel detects the push** via webhook (automatic connection)
2. **Vercel pulls your code** from GitHub
3. **Vercel installs dependencies** (`npm install`)
4. **Vercel builds your app** (`npm run build`)
5. **Vercel injects environment variables** (your Supabase keys)
6. **Vercel deploys to CDN** (Content Delivery Network - servers around the world)
7. **Your app is live!** Everyone can access it via the URL

All of this happens automatically in about 2-5 minutes!

---

## Pro Tips

### Custom Domain (Optional)

Want your own domain like `clay tennisconnect.com`?

1. In Vercel project settings, go to **"Domains"**
2. Add your domain
3. Follow Vercel's instructions to update DNS records
4. Wait for DNS propagation (can take up to 24 hours)

### Preview Deployments

Every time you push to a branch (not just `main`), Vercel creates a preview deployment. This lets you test changes before merging to main!

### Environment-Specific Variables

You can set different environment variables for:
- **Production**: Your live site
- **Preview**: Test deployments from branches
- **Development**: Local development (if using Vercel CLI)

### Monitoring

Vercel provides analytics and monitoring:
- Visit counts
- Performance metrics
- Error logs
- Function logs (if using API routes)

---

## Summary Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables added (SUPABASE_URL and SUPABASE_ANON_KEY)
- [ ] App redeployed with environment variables
- [ ] Tested signup/login functionality
- [ ] Verified database connection works

---

## Need Help?

- **Vercel Documentation**: https://vercel.com/docs
- **GitHub Guides**: https://guides.github.com
- **Supabase Docs**: https://supabase.com/docs
- **Check your code comments**: All code has detailed explanations!

Congratulations! Your Impero Sport app is now live on the internet! 🎉


