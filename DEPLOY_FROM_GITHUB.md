# Deploy to Vercel Directly from GitHub

Your code is already on GitHub at: **https://github.com/zakariatariq2005-sudo/padelconnect**

Now let's deploy it to Vercel in 3 simple steps!

## 🚀 Method 1: Vercel Web Interface (Recommended - 5 minutes)

### Step 1: Go to Vercel

1. Open: https://vercel.com
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
3. Choose **"Continue with GitHub"** (this automatically connects your GitHub account)

### Step 2: Import Your Repository

1. After signing in, you'll see the Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. You'll see a list of your GitHub repositories
4. Find **"padelconnect"** in the list
5. Click **"Import"** next to it

### Step 3: Configure and Deploy

Vercel will automatically detect it's a Next.js project. The settings should be:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅

**IMPORTANT: Don't click Deploy yet!** We need to add environment variables first.

#### Add Environment Variables:

1. Click on **"Environment Variables"** section
2. Add these two variables:

   **Variable 1:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase Project URL (from Supabase dashboard)
   - **Environments**: Select all three (Production, Preview, Development)
   - Click **"Save"**

   **Variable 2:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon/public key
   - **Environments**: Select all three (Production, Preview, Development)
   - Click **"Save"**

#### Deploy!

1. Click the **"Deploy"** button
2. Wait 2-5 minutes for the build to complete
3. Once done, you'll see a URL like: `https://padelconnect.vercel.app`
4. Click the URL to see your live app! 🎉

---

## 🔄 Automatic Deployments

**The best part:** Every time you push code to GitHub, Vercel automatically deploys it!

### How to Update Your App:

1. Make changes to your code locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Vercel automatically detects the push and starts a new deployment
4. Wait a few minutes, and your changes are live!

---

## 🛠️ Method 2: Using Vercel CLI (If Installed)

If you have Vercel CLI installed and want to deploy from terminal:

```bash
# Navigate to your project
cd /Users/zakariatariq/Desktop/dev/project

# Login to Vercel (first time only)
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

---

## 📋 Quick Checklist

Before deploying:
- [ ] Code is on GitHub ✅ (Already done!)
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] Environment variables added (Supabase URL and Key)
- [ ] Supabase database set up (follow SUPABASE_SETUP.md)
- [ ] Click Deploy!

---

## 🔍 Get Your Supabase Credentials

If you don't have them yet:

1. Go to: https://app.supabase.com
2. Select your project (or create one)
3. Go to: **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ After Deployment

1. **Test your app**: Visit the Vercel URL
2. **Try signing up**: Create a test account
3. **Verify it works**: Check that you can log in and see the dashboard

---

## 🎯 Your Repository

GitHub: https://github.com/zakariatariq2005-sudo/padelconnect

Once deployed, your live app will be at: `https://padelconnect.vercel.app` (or similar)

---

## ❓ Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Make sure Supabase credentials are valid

### "Cannot connect to Supabase"
- Double-check environment variable values
- Ensure no extra spaces in values
- Verify Supabase project is active (not paused)

### App works locally but not on Vercel
- Make sure environment variables are added in Vercel
- Redeploy after adding variables
- Check Supabase database is set up

---

**Ready to deploy?** Go to https://vercel.com and follow Method 1 above! 🚀


